import { useState } from 'react'

const COLORS = ['#6366f1', '#ec4899', '#22c55e', '#f97316', '#0ea5e9', '#a855f7']
const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']

function ChildManager({ children, addChild, updateChild, deleteChild }) {
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [color, setColor] = useState(COLORS[0])

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !/^\d{4}$/.test(pin)) {
      alert('이름과 4자리 숫자 PIN을 입력해주세요')
      return
    }
    const error = await addChild(name.trim(), pin, color)
    if (error) alert(error.message)
    else {
      setName('')
      setPin('')
    }
  }

  return (
    <section className="settings-section">
      <h3>자녀 관리</h3>
      <div className="child-list">
        {children.map((c) => (
          <div key={c.id} className="child-row">
            <span className="color-dot" style={{ backgroundColor: c.color }} />
            <span className="child-row__name">{c.name}</span>
            <input
              className="input input--small"
              value={c.pin}
              maxLength={4}
              onChange={(e) => updateChild(c.id, { pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            />
            <button type="button" className="btn btn--small btn--danger" onClick={() => window.confirm(`${c.name} 삭제할까요? 관련 항목도 함께 삭제됩니다.`) && deleteChild(c.id)}>삭제</button>
          </div>
        ))}
      </div>
      <form className="inline-form" onSubmit={submit}>
        <input className="input" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input input--small" placeholder="PIN 4자리" value={pin} maxLength={4} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} />
        <div className="color-picker">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`color-swatch ${color === c ? 'color-swatch--selected' : ''}`}
              style={{ backgroundColor: c }}
              aria-label={c}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <button type="submit" className="btn btn--primary">자녀 추가</button>
      </form>
    </section>
  )
}

function TaskForm({ children, onSubmit, initial, onCancel }) {
  const [childId, setChildId] = useState(initial?.child_id || children[0]?.id || '')
  const [name, setName] = useState(initial?.name || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [amount, setAmount] = useState(initial?.amount ?? 1000)
  const [weeklyTarget, setWeeklyTarget] = useState(initial?.weekly_target ?? 7)
  const [perCompletion, setPerCompletion] = useState(initial?.per_completion ?? false)
  const [subitemsText, setSubitemsText] = useState(initial?.subitems?.join(', ') || '')
  const [activeDays, setActiveDays] = useState(initial?.active_days ?? [0, 1, 2, 3, 4, 5, 6])

  const subitems = subitemsText.split(',').map((s) => s.trim()).filter(Boolean)
  const useSubitems = subitems.length > 0
  const restrictedDays = activeDays.length > 0 && activeDays.length < 7

  const toggleDay = (idx) => {
    setActiveDays((prev) => (prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx].sort()))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!childId || !name.trim() || amount <= 0) {
      alert('자녀, 항목명, 금액을 확인해주세요')
      return
    }
    if (!useSubitems && activeDays.length === 0) {
      alert('요일을 최소 1개 이상 선택해주세요')
      return
    }
    await onSubmit({
      child_id: childId,
      name: name.trim(),
      description: description.trim() || null,
      amount: Number(amount),
      weekly_target: useSubitems ? subitems.length : Number(weeklyTarget),
      per_completion: useSubitems ? false : perCompletion,
      subitems: useSubitems ? subitems : null,
      active_days: useSubitems || !restrictedDays ? null : activeDays,
    })
    if (!initial) {
      setName('')
      setDescription('')
      setAmount(1000)
      setWeeklyTarget(7)
      setPerCompletion(false)
      setSubitemsText('')
      setActiveDays([0, 1, 2, 3, 4, 5, 6])
    }
  }

  return (
    <form className="task-form" onSubmit={submit}>
      <div className="task-form__row">
        <select className="input" value={childId} onChange={(e) => setChildId(e.target.value)}>
          {children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input className="input" placeholder="항목 이름 (예: 방 청소)" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <input className="input" placeholder="설명 (선택)" value={description} onChange={(e) => setDescription(e.target.value)} />
      <label className="field">
        <span>체크 항목 (쉼표로 구분, 비워두면 요일별 체크로 동작 — 예: 영어, 수학)</span>
        <input className="input" placeholder="비워두면 요일 기준" value={subitemsText} onChange={(e) => setSubitemsText(e.target.value)} />
      </label>
      {!useSubitems && (
        <>
          <div className="task-form__row">
            <label className="radio-field">
              <input type="radio" checked={!perCompletion} onChange={() => setPerCompletion(false)} />
              <span>목표 달성시 1회 지급</span>
            </label>
            <label className="radio-field">
              <input type="radio" checked={perCompletion} onChange={() => setPerCompletion(true)} />
              <span>할 때마다 매번 지급</span>
            </label>
          </div>
          <label className="field">
            <span>적용 요일 (해제하면 그 요일은 체크 불가)</span>
            <div className="day-picker">
              {DAY_LABELS.map((label, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`day-toggle ${activeDays.includes(idx) ? 'day-toggle--on' : ''}`}
                  onClick={() => toggleDay(idx)}
                >
                  {label}
                </button>
              ))}
            </div>
          </label>
        </>
      )}
      <div className="task-form__row">
        <label className="field">
          <span>{perCompletion ? '1회당 금액(원)' : '금액(원)'}</span>
          <input className="input" type="number" min={0} step={100} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        {useSubitems ? (
          <label className="field">
            <span>주당 필요 개수</span>
            <input className="input" value={`${subitems.length}개 (모두 체크해야 지급)`} disabled />
          </label>
        ) : (
          <label className="field">
            <span>{perCompletion ? '주당 최대 인정 횟수' : '주당 필요 횟수'}</span>
            <select className="input" value={weeklyTarget} onChange={(e) => setWeeklyTarget(e.target.value)}>
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n}>
                  {n}회{!perCompletion && n === 7 ? ' (매일)' : ''}{!perCompletion && n === 1 ? ' (주 1회만 해도 지급)' : ''}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className="task-form__actions">
        <button type="submit" className="btn btn--primary">{initial ? '수정 완료' : '항목 추가'}</button>
        {initial && <button type="button" className="btn btn--ghost" onClick={onCancel}>취소</button>}
      </div>
    </form>
  )
}

export default function ParentTasks({ children, tasks, tasksApi, childrenApi }) {
  const [editingTask, setEditingTask] = useState(null)

  return (
    <div className="parent-tasks">
      <ChildManager
        children={children}
        addChild={childrenApi.addChild}
        updateChild={childrenApi.updateChild}
        deleteChild={childrenApi.deleteChild}
      />

      <section className="settings-section">
        <h3>{editingTask ? '항목 수정' : '용돈 항목 추가'}</h3>
        {children.length === 0 ? (
          <p className="empty-msg">먼저 자녀를 등록해주세요.</p>
        ) : editingTask ? (
          <TaskForm
            children={children}
            initial={editingTask}
            onCancel={() => setEditingTask(null)}
            onSubmit={async (values) => {
              await tasksApi.updateTask(editingTask.id, values)
              setEditingTask(null)
            }}
          />
        ) : (
          <TaskForm children={children} onSubmit={tasksApi.addTask} />
        )}
      </section>

      <section className="settings-section">
        <h3>등록된 항목</h3>
        <div className="task-table">
          {tasks.length === 0 && <p className="empty-msg">등록된 항목이 없어요.</p>}
          {children.map((child) => {
            const childTasks = tasks.filter((t) => t.child_id === child.id)
            if (childTasks.length === 0) return null
            return (
              <div key={child.id} className="task-table__group">
                <h4 style={{ color: child.color }}>{child.name}</h4>
                {childTasks.map((task) => (
                  <div key={task.id} className={`task-row ${!task.active ? 'task-row--inactive' : ''}`}>
                    <span className="task-row__name">{task.name}</span>
                    <span className="task-row__meta">
                      {task.subitems?.length
                        ? `${task.amount.toLocaleString()}원 · 체크리스트(${task.subitems.join('/')}) 모두 완료시 지급`
                        : `${task.amount.toLocaleString()}원${task.per_completion ? '/회' : ''} · 주 ${task.weekly_target}회${task.per_completion ? ' 한도' : ''}${task.active_days?.length ? ` · ${task.active_days.map((d) => DAY_LABELS[d]).join('')}만` : ''}`}
                    </span>
                    <div className="task-row__actions">
                      <button type="button" className="btn btn--small" onClick={() => setEditingTask(task)}>수정</button>
                      <button type="button" className="btn btn--small" onClick={() => tasksApi.updateTask(task.id, { active: !task.active })}>
                        {task.active ? '비활성화' : '활성화'}
                      </button>
                      <button type="button" className="btn btn--small btn--danger" onClick={() => window.confirm('이 항목을 삭제할까요?') && tasksApi.deleteTask(task.id)}>삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
