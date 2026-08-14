import { useState } from 'react'
import { useAdminAuth } from './hooks/useAdminAuth'
import { useChildAuth } from './hooks/useChildAuth'
import { useChildren } from './hooks/useChildren'
import { useTasks } from './hooks/useTasks'
import { useCheckins } from './hooks/useCheckins'

import ChildSelect from './components/ChildSelect'
import ChildPinPad from './components/ChildPinPad'
import ParentLogin from './components/ParentLogin'
import ChildHome from './pages/ChildHome'
import ParentDashboard from './pages/ParentDashboard'
import ParentTasks from './pages/ParentTasks'
import ParentHistory from './pages/ParentHistory'

const VIEW = {
  LANDING: 'landing',
  CHILD_PIN: 'child_pin',
  PARENT_LOGIN: 'parent_login',
}

export default function App() {
  const [view, setView] = useState(VIEW.LANDING)
  const [pendingChild, setPendingChild] = useState(null)
  const [parentTab, setParentTab] = useState('dashboard')

  const admin = useAdminAuth()
  const childAuth = useChildAuth()
  const { children, loading: childrenLoading, addChild, updateChild, deleteChild } = useChildren()
  const { tasks, addTask, updateTask, deleteTask, tasksForChild } = useTasks()
  const checkinsApi = useCheckins()

  if (childAuth.child) {
    return (
      <ChildHome
        child={childAuth.child}
        tasksForChild={tasksForChild}
        checkinsApi={checkinsApi}
        onLogout={() => {
          childAuth.logout()
          setView(VIEW.LANDING)
        }}
      />
    )
  }

  if (admin.isAdmin) {
    return (
      <div className="page">
        <header className="page__header">
          <h1>👨‍👩‍👧‍👦 부모 모드</h1>
          <button type="button" className="btn btn--ghost" onClick={() => { admin.logout(); setView(VIEW.LANDING) }}>로그아웃</button>
        </header>
        <nav className="tab-bar">
          <button type="button" className={`tab ${parentTab === 'dashboard' ? 'tab--active' : ''}`} onClick={() => setParentTab('dashboard')}>현황</button>
          <button type="button" className={`tab ${parentTab === 'tasks' ? 'tab--active' : ''}`} onClick={() => setParentTab('tasks')}>항목관리</button>
          <button type="button" className={`tab ${parentTab === 'history' ? 'tab--active' : ''}`} onClick={() => setParentTab('history')}>정산내역</button>
        </nav>
        {parentTab === 'dashboard' && (
          <ParentDashboard children={children} tasksForChild={tasksForChild} checkinsApi={checkinsApi} />
        )}
        {parentTab === 'tasks' && (
          <ParentTasks
            children={children}
            tasks={tasks}
            tasksApi={{ addTask, updateTask, deleteTask }}
            childrenApi={{ addChild, updateChild, deleteChild }}
          />
        )}
        {parentTab === 'history' && (
          <ParentHistory children={children} tasksForChild={tasksForChild} checkinsApi={checkinsApi} />
        )}
      </div>
    )
  }

  if (view === VIEW.PARENT_LOGIN) {
    return (
      <ParentLogin
        onLogin={admin.login}
        onBack={() => setView(VIEW.LANDING)}
        error={admin.error}
        loading={admin.loading}
      />
    )
  }

  if (view === VIEW.CHILD_PIN && pendingChild) {
    return (
      <ChildPinPad
        child={pendingChild}
        error={childAuth.error}
        onBack={() => { setView(VIEW.LANDING); setPendingChild(null); childAuth.setError('') }}
        onSubmit={(pin) => childAuth.login(pendingChild, pin)}
      />
    )
  }

  if (childrenLoading) {
    return <div className="page centered">불러오는 중...</div>
  }

  return (
    <ChildSelect
      children={children}
      onSelectChild={(child) => { setPendingChild(child); setView(VIEW.CHILD_PIN) }}
      onParentClick={() => setView(VIEW.PARENT_LOGIN)}
    />
  )
}
