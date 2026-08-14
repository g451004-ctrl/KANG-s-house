import { useState } from 'react'

export default function ParentLogin({ onLogin, onBack, error, loading }) {
  const [password, setPassword] = useState('')

  const submit = (e) => {
    e.preventDefault()
    onLogin(password)
  }

  return (
    <div className="parent-login">
      <button type="button" className="btn btn--ghost" onClick={onBack}>← 뒤로</button>
      <h2>🔒 부모 모드</h2>
      <form onSubmit={submit} className="parent-login__form">
        <input
          type="password"
          className="input"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error && <p className="pinpad__error">{error}</p>}
        <button type="submit" className="btn btn--primary" disabled={loading}>{loading ? '확인 중...' : '입장'}</button>
      </form>
    </div>
  )
}
