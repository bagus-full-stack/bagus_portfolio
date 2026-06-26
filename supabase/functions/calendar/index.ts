import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { google } from "npm:googleapis"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-date',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const SCOPES = ['https://www.googleapis.com/auth/calendar']

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(Deno.env.get('GOOGLE_CREDENTIALS') || '{}'),
      scopes: SCOPES
    })

    const calendar = google.calendar({ version: 'v3', auth })
    const CALENDAR_ID = Deno.env.get('GOOGLE_CALENDAR_ID') || ''

    const url = new URL(req.url)
    
    const reqBody = await req.json().catch(() => ({}));

    if (reqBody.action === 'slots' || url.searchParams.get('action') === 'slots') {
      const date = reqBody.date || url.searchParams.get('date') || req.headers.get('x-date');
      const timeMin = new Date(`${date}T09:00:00+02:00`)
      const timeMax = new Date(`${date}T18:00:00+02:00`)

      const { data } = await calendar.freebusy.query({
        requestBody: {
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          items: [{ id: CALENDAR_ID }]
        }
      })

      const busySlots = data.calendars?.[CALENDAR_ID]?.busy || []

      const allSlots = []
      let current = new Date(timeMin)
      while (current < timeMax) {
        const slotEnd = new Date(current.getTime() + 30 * 60000)
        const isBusy = busySlots.some(busy =>
          new Date(busy.start!) < slotEnd &&
          new Date(busy.end!) > current
        )
        if (!isBusy) {
          allSlots.push({
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

      return new Response(JSON.stringify({ slots: allSlots }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (req.method === 'POST') {
      const { start, end, attendeeName, attendeeEmail, subject, notes } = reqBody;

      const { data: event } = await calendar.events.insert({
        calendarId: CALENDAR_ID,
        sendUpdates: 'all',
        requestBody: {
          summary: `Appel — ${attendeeName}${subject ? ` : ${subject}` : ''}`,
          description: notes || '',
          start: {
            dateTime: start,
            timeZone: 'Europe/Paris'
          },
          end: {
            dateTime: end,
            timeZone: 'Europe/Paris'
          },
          attendees: [
            { email: attendeeEmail, displayName: attendeeName },
            { email: Deno.env.get('OWNER_EMAIL') || '' }
          ],
          conferenceData: {
            createRequest: {
              requestId: crypto.randomUUID(),
              conferenceSolutionKey: { type: 'hangoutsMeet' }
            }
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 1440 },
              { method: 'popup', minutes: 30 }
            ]
          }
        },
        conferenceDataVersion: 1
      })

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `DTSTART:${start.replace(/[-:]/g, '').replace('.000Z', 'Z')}`,
        `DTEND:${end.replace(/[-:]/g, '').replace('.000Z', 'Z')}`,
        `SUMMARY:Appel avec Assami Baga`,
        `DESCRIPTION:${notes || ''}`,
        `LOCATION:${event.hangoutLink || 'Google Meet'}`,
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n')

      return new Response(JSON.stringify({
        eventId: event.id,
        meetLink: event.hangoutLink,
        icsContent: btoa(icsContent)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    return new Response('Not found', { status: 404, headers: corsHeaders });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})
