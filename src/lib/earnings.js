// per_completion: 확인된 횟수만큼 매번 지급 (weekly_target은 주당 최대 인정 횟수)
// flat(기본): 확인된 횟수가 weekly_target 이상이어야 amount 1회 지급
export function computeEarned(task, verifiedCount) {
  if (task.per_completion) {
    return Math.min(verifiedCount, task.weekly_target) * task.amount
  }
  return verifiedCount >= task.weekly_target ? task.amount : 0
}

// task.subitems가 있으면 요일 대신 체크리스트(item) 단위로 집계
export function getWeeklyCount(task, checkinsApi, weekDate) {
  if (task.subitems?.length) {
    return checkinsApi.verifiedItemsCountInWeek(task.id, task.subitems, weekDate)
  }
  return checkinsApi.verifiedCountInWeek(task.id, weekDate)
}
