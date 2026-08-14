import { addWeeks, formatWeekRangeLabel } from '../lib/dateUtils'
import { computeEarned, getWeeklyCount } from '../lib/earnings'

const WEEKS_TO_SHOW = 8

export default function ParentHistory({ children, tasksForChild, checkinsApi }) {
  const now = new Date()
  const weeks = Array.from({ length: WEEKS_TO_SHOW }, (_, i) => addWeeks(now, -i))

  return (
    <div className="parent-history">
      <h2 className="section-title">주간 정산 내역</h2>
      {children.map((child) => {
        const tasks = tasksForChild(child.id, false)
        return (
          <div key={child.id} className="history-block">
            <h3 style={{ color: child.color }}>{child.name}</h3>
            <table className="history-table">
              <thead>
                <tr>
                  <th>주</th>
                  <th>달성 항목</th>
                  <th>합계</th>
                </tr>
              </thead>
              <tbody>
                {weeks.map((weekDate, i) => {
                  const earnedTasks = tasks
                    .map((t) => ({ task: t, earned: computeEarned(t, getWeeklyCount(t, checkinsApi, weekDate)) }))
                    .filter(({ earned }) => earned > 0)
                  const total = earnedTasks.reduce((sum, { earned }) => sum + earned, 0)
                  return (
                    <tr key={i} className={i === 0 ? 'history-table__current' : ''}>
                      <td>{formatWeekRangeLabel(weekDate)}{i === 0 ? ' (진행중)' : ''}</td>
                      <td>{earnedTasks.length > 0 ? earnedTasks.map(({ task, earned }) => `${task.name}(${earned.toLocaleString()}원)`).join(', ') : '-'}</td>
                      <td>{total.toLocaleString()}원</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}
