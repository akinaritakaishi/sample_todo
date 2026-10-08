export function formatDue(dateString) {
  if (!dateString) return ''
  const [y, m, d] = dateString.split('-')
  return `${y}/${m}/${d}`
}

// Build a local-date YYYY-MM-DD string. Avoid toISOString() / new Date('YYYY-MM-DD'):
// both are UTC and shift the date by a day before 09:00 in JST.
function toLocalDateString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const DUE_STATUS_LABELS = {
  overdue: '期限切れ',
  today: '今日',
  tomorrow: '明日',
}

export function getDueStatus(due, now = new Date()) {
  if (!due) return null
  const today = toLocalDateString(now)
  const tomorrowDate = new Date(now)
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrow = toLocalDateString(tomorrowDate)
  if (due < today) return 'overdue'
  if (due === today) return 'today'
  if (due === tomorrow) return 'tomorrow'
  return null
}
