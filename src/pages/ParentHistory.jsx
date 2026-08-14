import { addWeeks, formatWeekRangeLabel } from '../lib/dateUtils'

const WEEKS_TO_SHOW = 8

export default function ParentHistory({ children, tasksForChild, checkinsApi }) {
  const { verifiedCountInWeek } = checkinsApi
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
                  const achievedTasks = tasks.filter((t) => verifiedCountInWeek(t.id, weekDate) >= t.weekly_target)
                  const total = achievedTasks.reduce((sum, t) => sum + t.amount, 0)
                  return (
                    <tr key={i} className={i === 0 ? 'history-table__current' : ''}>
                      <td>{formatWeekRangeLabel(weekDate)}{i === 0 ? ' (진행중)' : ''}</td>
                      <td>{achievedTasks.length > 0 ? achievedTasks.map((t) => t.name).join(', ') : '-'}</td>
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
