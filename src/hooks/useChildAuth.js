import { useState, useEffect, useCallback } from 'react'

const SESSION_KEY = 'allowance_child_session'
const SESSION_TTL = 1000 * 60 * 60 * 12 // 12시간

export function useChildAuth() {
  const [child, setChild] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const session = sessionStorage.getItem(SESSION_KEY)
    if (session) {
      try {
        const { child: savedChild, expiry } = JSON.parse(session)
        if (Date.now() < expiry) setChild(savedChild)
        else sessionStorage.removeItem(SESSION_KEY)
      } catch {
        sessionStorage.removeItem(SESSION_KEY)
      }
    }
  }, [])

  const login = useCallback((targetChild, pin) => {
    setError('')
    if (pin !== targetChild.pin) {
      setError('PIN 번호가 올바르지 않습니다')
      return false
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ child: targetChild, expiry: Date.now() + SESSION_TTL }))
    setChild(targetChild)
    return true
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setChild(null)
  }, [])

  return { child, login, logout, error, setError }
}
