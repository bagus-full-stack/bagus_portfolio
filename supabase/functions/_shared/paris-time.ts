const TZ = 'Europe/Paris'

// Décalage (minutes) de Paris par rapport à UTC à un instant donné : gère heure d'été et d'hiver
export const parisOffsetMin = (d: Date) => {
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
export const parisTime = (date: string, hour: number) => {
  const guess = new Date(`${date}T${String(hour).padStart(2, '0')}:00:00Z`)
  return new Date(guess.getTime() - parisOffsetMin(guess) * 60000)
}
