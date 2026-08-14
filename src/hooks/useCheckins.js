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

  // 아이가 스스로 체크 / 체크 취소 (인증 전에만 취소 가능) - 요일 기반 항목용
  const toggleCheck = useCallback(async (taskId, childId, dateStr) => {
    const existing = checkins.find(c => c.task_id === taskId && c.date === dateStr && c.item === '')
    if (existing && existing.checked_at) {
      if (existing.verified) return { error: '이미 부모님이 인증한 항목은 취소할 수 없어요' }
      const { error } = await supabase.from('checkins').update({ checked_at: null }).eq('id', existing.id)
      if (!error) fetchCheckins()
      return { error }
    }
    const { error } = await supabase
      .from('checkins')
      .upsert({ task_id: taskId, child_id: childId, date: dateStr, item: '', checked_at: new Date().toISOString(), verified: false }, { onConflict: 'task_id,date,item' })
    if (!error) fetchCheckins()
    return { error }
  }, [checkins, fetchCheckins])

  // 아이가 스스로 체크 / 체크 취소 - subitems(체크리스트) 기반 항목용. 날짜가 아니라 그 주 안에서 item 단위로 관리.
  const toggleItemCheck = useCallback(async (taskId, childId, item, weekDate) => {
    const { start, end } = getWeekRange(weekDate)
    const startStr = formatDate(start)
    const endStr = formatDate(end)
    const existing = checkins.find(c => c.task_id === taskId && c.item === item && c.date >= startStr && c.date <= endStr)
    if (existing) {
      if (existing.verified) return { error: '이미 부모님이 인증한 항목은 취소할 수 없어요' }
      const { error } = await supabase
        .from('checkins')
        .update({ checked_at: existing.checked_at ? null : new Date().toISOString() })
        .eq('id', existing.id)
      if (!error) fetchCheckins()
      return { error }
    }
    const { error } = await supabase
      .from('checkins')
      .insert({ task_id: taskId, child_id: childId, date: formatDate(new Date()), item, checked_at: new Date().toISOString(), verified: false })
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
    return checkins.find(c => c.task_id === taskId && c.date === dateStr && c.item === '') || null
  }, [checkins])

  // subitems(체크리스트) 기반 항목의 특정 item에 대한 checkin 조회 (승인 취소 시 id가 필요)
  const checkinForItem = useCallback((taskId, item, weekDate) => {
    const { start, end } = getWeekRange(weekDate)
    const startStr = formatDate(start)
    const endStr = formatDate(end)
    return checkins.find(c => c.task_id === taskId && c.item === item && c.date >= startStr && c.date <= endStr) || null
  }, [checkins])

  // 특정 task가 특정 주에 verified 체크된 횟수 (요일 기반 항목용)
  const verifiedCountInWeek = useCallback((taskId, weekDate) => {
    const { start, end } = getWeekRange(weekDate)
    const startStr = formatDate(start)
    const endStr = formatDate(end)
    return checkins.filter(c => c.task_id === taskId && c.item === '' && c.verified && c.date >= startStr && c.date <= endStr).length
  }, [checkins])

  // subitems 기반 항목의 이번 주 상태 맵: { [item]: 'empty' | 'pending' | 'verified' }
  const itemStatesInWeek = useCallback((taskId, items, weekDate) => {
    const { start, end } = getWeekRange(weekDate)
    const startStr = formatDate(start)
    const endStr = formatDate(end)
    const map = {}
    for (const item of items) {
      const c = checkins.find(ci => ci.task_id === taskId && ci.item === item && ci.date >= startStr && ci.date <= endStr)
      map[item] = c?.verified ? 'verified' : c?.checked_at ? 'pending' : 'empty'
    }
    return map
  }, [checkins])

  // subitems 기반 항목이 특정 주에 verified 체크된 개수
  const verifiedItemsCountInWeek = useCallback((taskId, items, weekDate) => {
    const { start, end } = getWeekRange(weekDate)
    const startStr = formatDate(start)
    const endStr = formatDate(end)
    return items.filter((item) =>
      checkins.some((c) => c.task_id === taskId && c.item === item && c.verified && c.date >= startStr && c.date <= endStr)
    ).length
  }, [checkins])

  const pendingForChild = useCallback((childId) => {
    return checkins
      .filter(c => c.child_id === childId && c.checked_at && !c.verified)
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [checkins])

  return {
    checkins,
    loading,
    toggleCheck,
    toggleItemCheck,
    verifyCheck,
    forCheckin,
    checkinForItem,
    verifiedCountInWeek,
    itemStatesInWeek,
    verifiedItemsCountInWeek,
    pendingForChild,
  }
}
