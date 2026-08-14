import WeekProgressCard from '../components/WeekProgressCard'
import { formatWeekRangeLabel } from '../lib/dateUtils'

const DAY_LABELS = { 0: '일', 1: '월', 2: '화', 3: '수', 4: '목', 5: '금', 6: '토' }

function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}/${d.getDate()} (${DAY_LABELS[d.getDay()]})`
}

export default function ParentDashboard({ children, tasksForChild, checkinsApi }) {
  const now = new Date()
  const { forCheckin, verifiedCountInWeek, verifyCheck, pendingForChild } = checkinsApi

  const taskLookup = (taskId, tasks) => tasks.find(t => t.id === taskId)

  return (
    <div className="parent-dashboard">
      <h2 className="section-title">이번 주 ({formatWeekRangeLabel(now)}) 현황</h2>
      <div className="parent-columns">
        {children.map((child) => {
          const tasks = tasksForChild(child.id)
          const pending = pendingForChild(child.id)
          const total = tasks.reduce((sum, t) => {
            const count = verifiedCountInWeek(t.id, now)
            return sum + (count >= t.weekly_target ? t.amount : 0)
          }, 0)

          return (
            <div key={child.id} className="parent-column">
              <div className="parent-column__head" style={{ borderColor: child.color }}>
                <h3>{child.name}</h3>
                <span className="parent-column__total">{total.toLocaleString()}원</span>
              </div>

              {pending.length > 0 && (
                <div className="pending-box">
                  <h4>✋ 인증 대기 ({pending.length})</h4>
                  {pending.map((c) => {
                    const task = taskLookup(c.task_id, tasks)
                    if (!task) return null
                    return (
                      <div key={c.id} className="pending-item">
                        <span>{task.name} · {formatDateLabel(c.date)}</span>
                        <div className="pending-item__actions">
                          <button type="button" className="btn btn--small btn--primary" onClick={() => verifyCheck(c.id, true)}>승인</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="task-list">
                {tasks.length === 0 && <p className="empty-msg">등록된 항목이 없어요.</p>}
                {tasks.map((task) => (
                  <WeekProgressCard
                    key={task.id}
                    task={task}
                    weekDate={now}
                    forCheckin={forCheckin}
                    verifiedCount={verifiedCountInWeek(task.id, now)}
                    mode="view"
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
