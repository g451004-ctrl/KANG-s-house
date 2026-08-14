import { useState } from 'react'

export default function ChildPinPad({ child, onSubmit, onBack, error }) {
  const [pin, setPin] = useState('')

  const press = (digit) => {
    if (pin.length >= 4) return
    const next = pin + digit
    setPin(next)
    if (next.length === 4) {
      onSubmit(next)
      setTimeout(() => setPin(''), 300)
    }
  }

  const backspace = () => setPin(pin.slice(0, -1))

  return (
    <div className="pinpad">
      <button type="button" className="btn btn--ghost pinpad__back" onClick={onBack}>← 뒤로</button>
      <h2 className="pinpad__title">{child.name}의 PIN을 입력하세요</h2>
      <div className="pinpad__dots">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`pinpad__dot ${i < pin.length ? 'pinpad__dot--filled' : ''}`} />
        ))}
      </div>
      {error && <p className="pinpad__error">{error}</p>}
      <div className="pinpad__grid">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((key, i) => {
          if (key === '') return <div key={i} />
          if (key === '⌫') {
            return (
              <button type="button" key={i} className="pinpad__key" onClick={backspace}>⌫</button>
            )
          }
          return (
            <button type="button" key={i} className="pinpad__key" onClick={() => press(key)}>{key}</button>
          )
        })}
      </div>
    </div>
  )
}
