import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { google } from "npm:googleapis"
import {
  getCorsHeaders,
  isOriginAllowed,
  handlePreflight
} from "../_shared/cors.ts"

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(Deno.env.get('GOOGLE_CREDENTIALS') || '{}'),
  scopes: ['https://www.googleapis.com/auth/calendar']
})

const calendar = google.calendar({ version: 'v3', auth })
const CALENDAR_ID = Deno.env.get('GOOGLE_CALENDAR_ID') || ''

const TZ = 'Europe/Paris'
const SLOT_MINUTES = 30
const DAY_START_HOUR = 9
const DAY_END_HOUR = 18
const MAX_DAYS_AHEAD = 60
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/

// Décalage (minutes) de Paris par rapport à UTC à un instant donné : gère heure d'été et d'hiver
const parisOffsetMin = (d: Date) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).formatToParts(d)
  const get = (t: string) => Number(parts.find(p => p.type === t)!.value)
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'))
  return Math.round((asUtc - d.getTime()) / 60000)
}

// Instant UTC de « date à hh:00 » heure de Paris
const parisTime = (date: string, hour: number) => {
  const guess = new Date(`${date}T${String(hour).padStart(2, '0')}:00:00Z`)
  return new Date(guess.getTime() - parisOffsetMin(guess) * 60000)
}

// Limite de réservations par IP (mémoire de l'instance : suffit à freiner un script simple)
const BOOKING_WINDOW_MS = 60 * 60 * 1000
const BOOKING_MAX = 3
const bookingsByIp = new Map<string, number[]>()
const tooManyBookings = (ip: string) => {
  const now = Date.now()
  const recent = (bookingsByIp.get(ip) || []).filter(t => now - t < BOOKING_WINDOW_MS)
  if (recent.length >= BOOKING_MAX) return true
  recent.push(now)
  bookingsByIp.set(ip, recent)
  if (bookingsByIp.size > 1000) {
    for (const [k, v] of bookingsByIp) if (v.every(t => now - t >= BOOKING_WINDOW_MS)) bookingsByIp.delete(k)
  }
  return false
}

const json = (body: unknown, status: number, corsHeaders: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

serve(async (req) => {
  const { method } = req
  const url = new URL(req.url)

  const origin = req.headers.get('origin')

  // Gérer le preflight OPTIONS
  const preflightResponse = handlePreflight(req)
  if (preflightResponse) return preflightResponse

  // Vérifier l'origine en production
  if (!isOriginAllowed(origin)) {
    return new Response(
      JSON.stringify({
        error: 'Accès non autorisé'
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(origin)
        }
      }
    )
  }

  // Headers CORS à inclure dans TOUTES les réponses
  const corsHeaders = getCorsHeaders(origin)

  try {
    // Le corps ne se lit qu'une fois : on le parse ici pour les deux branches
    const body = method === 'POST' ? await req.json().catch(() => ({})) : {}

    // GET ?date=… ou POST { action: 'slots', date } (ou ?action=slots) → créneaux disponibles
    if (method === 'GET' || body.action === 'slots' || url.searchParams.get('action') === 'slots') {
      const date = url.searchParams.get('date') || body.date;

      if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(`${date}T00:00:00Z`).getTime())) {
        return json({ error: 'Date is required (YYYY-MM-DD)' }, 400, corsHeaders)
      }

      // Vérifier les disponibilités via freebusy (09h-18h heure de Paris, été comme hiver)
      const timeMin = parisTime(date, DAY_START_HOUR)
      const timeMax = parisTime(date, DAY_END_HOUR)

      const { data } = await calendar.freebusy.query({
        requestBody: {
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          timeZone: 'Europe/Paris',
          items: [{ id: CALENDAR_ID }]
        }
      })

      const busy = data.calendars?.[CALENDAR_ID]?.busy || []

      // Générer les créneaux de 30 min
      const slots = []
      const nowMs = Date.now()
      let current = new Date(timeMin)

      while (current < timeMax) {
        const slotEnd = new Date(current.getTime() + 30 * 60000)
        const isBusy = busy.some(b =>
          new Date(b.start!) < slotEnd &&
          new Date(b.end!) > current
        )

        if (!isBusy && current.getTime() > nowMs) {
          slots.push({
            start: current.toISOString(),
            end: slotEnd.toISOString(),
            label: current.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Europe/Paris'
            })
          })
        }
        current = slotEnd
      }

      return new Response(
        JSON.stringify({ slots }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST → Créer la réunion Google Meet
    if (method === 'POST') {
      const {
        start, end,
        attendeeName, attendeeEmail,
        subject, notes
      } = body

      // Validation : cet endpoint est public et envoie de vrais e-mails d'invitation
      const startD = new Date(start)
      const endD = new Date(end)
      const nowMs = Date.now()
      const local = new Date(startD.getTime() + parisOffsetMin(startD) * 60000)
      const minutes = local.getUTCHours() * 60 + local.getUTCMinutes()
      const validPeople =
        typeof attendeeName === 'string' && attendeeName.trim() !== '' && attendeeName.length <= 100 &&
        typeof attendeeEmail === 'string' && attendeeEmail.length <= 254 && EMAIL_RE.test(attendeeEmail) &&
        (subject == null || (typeof subject === 'string' && subject.length <= 200)) &&
        (notes == null || (typeof notes === 'string' && notes.length <= 1000))
      const validSlot =
        !isNaN(startD.getTime()) && !isNaN(endD.getTime()) &&
        endD.getTime() - startD.getTime() === SLOT_MINUTES * 60000 &&
        startD.getTime() > nowMs && startD.getTime() < nowMs + MAX_DAYS_AHEAD * 86400000 &&
        minutes % SLOT_MINUTES === 0 &&
        minutes >= DAY_START_HOUR * 60 && minutes + SLOT_MINUTES <= DAY_END_HOUR * 60
      if (!validPeople || !validSlot) {
        return json({ error: 'Invalid booking request' }, 400, corsHeaders)
      }

      const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
      if (tooManyBookings(ip)) {
        return json({ error: 'Too many bookings, try again later' }, 429, corsHeaders)
      }

      // Le créneau a pu être pris depuis l'affichage de la liste
      const { data: fb } = await calendar.freebusy.query({
        requestBody: {
          timeMin: startD.toISOString(),
          timeMax: endD.toISOString(),
          timeZone: TZ,
          items: [{ id: CALENDAR_ID }]
        }
      })
      if ((fb.calendars?.[CALENDAR_ID]?.busy || []).length > 0) {
        return json({ error: 'Slot no longer available' }, 409, corsHeaders)
      }

      const { data: event } = await calendar.events.insert({
        calendarId: CALENDAR_ID,
        sendUpdates: 'all', // emails automatiques aux participants
        conferenceDataVersion: 1, // active la création Meet
        requestBody: {
          summary: `Appel avec ${attendeeName}${
            subject ? ` — ${subject}` : ''
          }`,
          description: [
            notes ? `Notes : ${notes}` : '',
            '',
            'Réunion créée depuis bagus-full-stack.me'
          ].filter(Boolean).join('\n'),

          start: {
            dateTime: start,
            timeZone: 'Europe/Paris'
          },
          end: {
            dateTime: end,
            timeZone: 'Europe/Paris'
          },

          attendees: [
            {
              email: attendeeEmail,
              displayName: attendeeName
            },
            {
              email: Deno.env.get('OWNER_EMAIL') || '',
              displayName: 'Assami Baga',
              organizer: true
            }
          ],

          conferenceData: {
            createRequest: {
              requestId: crypto.randomUUID(),
              conferenceSolutionKey: {
                type: 'hangoutsMeet'
              }
            }
          },

          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 1440 }, // J-1
              { method: 'email', minutes: 60 },   // H-1
              { method: 'popup', minutes: 15 }    // 15 min avant
            ]
          }
        }
      })

      // Générer le fichier .ics en complément
      const meetLink = event.hangoutLink || ''
      const icsLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Assami Baga Portfolio//FR',
        'BEGIN:VEVENT',
        `UID:${event.id}@bagus-full-stack.me`,
        `DTSTART:${start.replace(/[-:]/g, '').replace('.000Z', 'Z')}`,
        `DTEND:${end.replace(/[-:]/g, '').replace('.000Z', 'Z')}`,
        `SUMMARY:Appel avec Assami Baga`,
        `DESCRIPTION:Lien Meet : ${meetLink}`,
        `LOCATION:${meetLink}`,
        `URL:${meetLink}`,
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n')

      return new Response(
        JSON.stringify({
          eventId: event.id,
          meetLink,
          icsContent: btoa(icsLines)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  } catch (error: any) {
    // Erreur générique — pas de détails techniques
    return new Response(JSON.stringify({ error: 'Une erreur est survenue' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

