import { computeEarned } from '../lib/earnings'

// subitems(체크리스트)가 있는 항목용 카드. 요일 대신 항목명을 체크한다.
export default function TaskItemsCard({ task, itemStates, verifiedCount, mode = 'view', onToggle }) {
  const target = task.weekly_target
  const earned = computeEarned(task, verifiedCount)
  const achieved = task.per_completion ? verifiedCount > 0 : verifiedCount >= target

  return (
    <div className={`task-card ${achieved ? 'task-card--done' : ''}`}>
      <div className="task-card__head">
        <div className="task-card__name">{task.name}</div>
        <div className="task-card__amount">{task.amount.toLocaleString()}원{task.per_completion ? '/개' : ''}</div>
      </div>
      {task.description && <div className="task-card__desc">{task.description}</div>}
      <div className="task-card__items">
        {task.subitems.map((item) => {
          const state = itemStates[item] || 'empty'
          const clickable = mode === 'child' && state !== 'verified'
          return (
            <button
              key={item}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onToggle(task.id, item)}
              className={`item-chip item-chip--${state}`}
            >
              {item} {state === 'verified' ? '✓' : state === 'pending' ? '●' : ''}
            </button>
          )
        })}
      </div>
      <div className="task-card__footer">
        <div className="progress-bar">
          <div className="progress-bar__fill" style={{ width: `${Math.min(100, (verifiedCount / target) * 100)}%` }} />
        </div>
        <span className="task-card__count">{verifiedCount} / {target}개</span>
        {task.per_completion
          ? earned > 0 && <span className="task-card__badge">{earned.toLocaleString()}원 확정</span>
          : achieved && <span className="task-card__badge">달성!</span>}
      </div>
    </div>
  )
}
