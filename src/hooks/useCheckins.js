import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { formatDate, getWeekRange } from '../lib/dateUtils'

export function useCheckins() {
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCheckins = useCallback(async () => {
    // 최근 10주 정도만 불러와도 이번주 진행상황 + 정산내역 조회에 충분
    const since = new Date()
    since.setDate(since.getDate() - 70)
    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .gte('date', formatDate(since))
    if (!error) setCheckins(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCheckins()
    const channel = supabase
      .channel('checkins-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checkins' }, fetchCheckins)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchCheckins])

  // 아이가 스스로 체크 / 체크 취소 (인증 전에만 취소 가능)
  const toggleCheck = useCallback(async (taskId, childId, dateStr) => {
    const existing = checkins.find(c => c.task_id === taskId && c.date === dateStr)
    if (existing && existing.checked_at) {
      if (existing.verified) return { error: '이미 부모님이 인증한 항목은 취소할 수 없어요' }
      const { error } = await supabase.from('checkins').update({ checked_at: null }).eq('id', existing.id)
      if (!error) fetchCheckins()
      return { error }
    }
    const { error } = await supabase
      .from('checkins')
      .upsert({ task_id: taskId, child_id: childId, date: dateStr, checked_at: new Date().toISOString(), verified: false }, { onConflict: 'task_id,date' })
    if (!error) fetchCheckins()
    return { error }
  }, [checkins, fetchCheckins])

  const verifyCheck = useCallback(async (checkinId, verified) => {
    const { error } = await supabase
      .from('checkins')
      .update({ verified, verified_at: verified ? new Date().toISOString() : null })
      .eq('id', checkinId)
    if (!error) fetchCheckins()
    return error
  }, [fetchCheckins])

  const forCheckin = useCallback((taskId, dateStr) => {
    return checkins.find(c => c.task_id === taskId && c.date === dateStr) || null
  }, [checkins])

  // 특정 task가 특정 주에 verified 체크된 횟수
  const verifiedCountInWeek = useCallback((taskId, weekDate) => {
    const { start, end } = getWeekRange(weekDate)
    const startStr = formatDate(start)
    const endStr = formatDate(end)
    return checkins.filter(c => c.task_id === taskId && c.verified && c.date >= startStr && c.date <= endStr).length
  }, [checkins])

  const pendingForChild = useCallback((childId) => {
    return checkins
      .filter(c => c.child_id === childId && c.checked_at && !c.verified)
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [checkins])

  return { checkins, loading, toggleCheck, verifyCheck, forCheckin, verifiedCountInWeek, pendingForChild }
}
