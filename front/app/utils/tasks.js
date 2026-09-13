export function formatDue(dateString) {
  if (!dateString) return ''
  const [y, m, d] = dateString.split('-')
  return `${y}/${m}/${d}`
}
