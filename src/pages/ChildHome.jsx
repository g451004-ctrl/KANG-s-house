import { useState, useMemo } from 'react'
import WeekProgressCard from '../components/WeekProgressCard'
import { addWeeks, formatWeekRangeLabel } from '../lib/dateUtils'
import { computeEarned } from '../lib/earnings'

export default function ChildHome({ child, tasksForChild, checkinsApi, onLogout }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const weekDate = useMemo(() => addWeeks(new Date(), weekOffset), [weekOffset])
  const tasks = tasksForChild(child.id)
  const { forCheckin, verifiedCountInWeek, toggleCheck } = checkinsApi

  const total = tasks.reduce((sum, t) => sum + computeEarned(t, verifiedCountInWeek(t.id, weekDate)), 0)

  const handleToggle = async (taskId, dateStr) => {
    const { error } = await toggleCheck(taskId, child.id, dateStr)
    if (error) alert(typeof error === 'string' ? error : error.message)
  }

  return (
    <div className="page">
      <header className="page__header" style={{ borderColor: child.color }}>
        <div>
          <h1>{child.name}의 용돈</h1>
          <p className="week-nav">
            <button type="button" className="btn btn--ghost" onClick={() => setWeekOffset(weekOffset - 1)}>◀</button>
            <span>{formatWeekRangeLabel(weekDate)}</span>
            <button type="button" className="btn btn--ghost" disabled={weekOffset >= 0} onClick={() => setWeekOffset(Math.min(0, weekOffset + 1))}>▶</button>
          </p>
        </div>
        <button type="button" className="btn btn--ghost" onClick={onLogout}>로그아웃</button>
      </header>

      <div className="total-banner" style={{ backgroundColor: child.color }}>
        이번 주 확정 용돈 <strong>{total.toLocaleString()}원</strong>
      </div>

      <div className="task-list">
        {tasks.length === 0 && <p className="empty-msg">아직 등록된 항목이 없어요. 부모님께 말씀드려보세요!</p>}
        {tasks.map((task) => (
          <WeekProgressCard
            key={task.id}
            task={task}
            weekDate={weekDate}
            forCheckin={forCheckin}
            verifiedCount={verifiedCountInWeek(task.id, weekDate)}
            mode={weekOffset === 0 ? 'child' : 'view'}
            onToggle={handleToggle}
          />
        ))}
      </div>
      <p className="legend">● 체크됨(인증대기) &nbsp; ✓ 부모님 인증완료</p>
    </div>
  )
}
