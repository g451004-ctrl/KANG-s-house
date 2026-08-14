import { getWeekDays, isFuture, formatDate } from '../lib/dateUtils'
import { computeEarned } from '../lib/earnings'

// task 하나의 한 주 진행 상황을 보여주는 카드.
// mode='child' 이면 오늘/과거 칸을 탭해서 체크/취소 가능.
export default function WeekProgressCard({ task, weekDate, forCheckin, verifiedCount, mode = 'view', onToggle }) {
  const days = getWeekDays(weekDate)
  const target = task.weekly_target
  const earned = computeEarned(task, verifiedCount)
  const achieved = task.per_completion ? verifiedCount > 0 : verifiedCount >= target
  const todayStr = formatDate(new Date())

  return (
    <div className={`task-card ${achieved ? 'task-card--done' : ''}`}>
      <div className="task-card__head">
        <div className="task-card__name">{task.name}</div>
        <div className="task-card__amount">{task.amount.toLocaleString()}원{task.per_completion ? '/회' : ''}</div>
      </div>
      {task.description && <div className="task-card__desc">{task.description}</div>}
      <div className="task-card__days">
        {days.map(({ dateStr, label }, dayIndex) => {
          const inactive = task.active_days && !task.active_days.includes(dayIndex)
          if (inactive) {
            return (
              <div key={dateStr} className="day-cell day-cell--off" title="해당 없음">
                <span className="day-cell__label">{label}</span>
                <span className="day-cell__mark">－</span>
              </div>
            )
          }
          const checkin = forCheckin(task.id, dateStr)
          const future = isFuture(dateStr)
          const state = checkin?.verified ? 'verified' : checkin?.checked_at ? 'pending' : 'empty'
          const clickable = mode === 'child' && !future && state !== 'verified'
          return (
            <button
              key={dateStr}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onToggle(task.id, dateStr)}
              className={`day-cell day-cell--${state} ${dateStr === todayStr ? 'day-cell--today' : ''} ${future ? 'day-cell--future' : ''}`}
              title={dateStr}
            >
              <span className="day-cell__label">{label}</span>
              <span className="day-cell__mark">
                {state === 'verified' ? '✓' : state === 'pending' ? '●' : ''}
              </span>
            </button>
          )
        })}
      </div>
      <div className="task-card__footer">
        <div className="progress-bar">
          <div className="progress-bar__fill" style={{ width: `${Math.min(100, (verifiedCount / target) * 100)}%` }} />
        </div>
        <span className="task-card__count">{verifiedCount} / {target}회{task.per_completion ? ' (최대)' : ''}</span>
        {task.per_completion
          ? earned > 0 && <span className="task-card__badge">{earned.toLocaleString()}원 확정</span>
          : achieved && <span className="task-card__badge">달성!</span>}
      </div>
    </div>
  )
}
