const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']

function toDateOnly(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function formatDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// 월요일 시작 ~ 일요일 종료 주 범위
export function getWeekRange(date = new Date()) {
  const d = toDateOnly(date)
  const dow = d.getDay() // 0=일 ... 6=토
  const mondayOffset = dow === 0 ? -6 : 1 - dow
  const monday = new Date(d)
  monday.setDate(d.getDate() + mondayOffset)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { start: monday, end: sunday }
}

export function getWeekDays(date = new Date()) {
  const { start } = getWeekRange(date)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return { date: d, dateStr: formatDate(d), label: DAY_LABELS[i] }
  })
}

export function addWeeks(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n * 7)
  return d
}

export function isToday(dateStr) {
  return dateStr === formatDate(new Date())
}

export function isFuture(dateStr) {
  return dateStr > formatDate(new Date())
}

export function formatWeekRangeLabel(date = new Date()) {
  const { start, end } = getWeekRange(date)
  const fmt = (d) => `${d.getMonth() + 1}/${d.getDate()}`
  return `${fmt(start)} ~ ${fmt(end)}`
}
