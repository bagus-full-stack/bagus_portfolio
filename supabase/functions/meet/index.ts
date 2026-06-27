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
    // GET ?date=2024-06-23 → créneaux disponibles
    // Note: Supabase Edge Functions with GET don't usually send body, so we read from query string
    if (method === 'POST' && url.searchParams.get('action') === 'slots' || method === 'GET') {
      let date = url.searchParams.get('date');
      
      // Fallback to read from body if POST
      if (!date && method === 'POST') {
        const reqBody = await req.json().catch(() => ({}));
        date = reqBody.date;
      }
      
      if (!date) {
        return new Response(JSON.stringify({ error: 'Date is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      // Vérifier les disponibilités via freebusy
      const timeMin = new Date(`${date}T07:00:00Z`) // 09h Paris
      const timeMax = new Date(`${date}T16:00:00Z`) // 18h Paris

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
      let current = new Date(timeMin)

      while (current < timeMax) {
        const slotEnd = new Date(current.getTime() + 30 * 60000)
        const isBusy = busy.some(b =>
          new Date(b.start!) < slotEnd &&
          new Date(b.end!) > current
        )

        if (!isBusy) {
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
      } = await req.json()

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

