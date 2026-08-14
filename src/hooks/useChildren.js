import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useChildren() {
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchChildren = useCallback(async () => {
    const { data, error } = await supabase.from('children').select('*').order('created_at')
    if (!error) setChildren(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchChildren()
    const channel = supabase
      .channel('children-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'children' }, fetchChildren)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchChildren])

  const addChild = useCallback(async (name, pin, color) => {
    const { error } = await supabase.from('children').insert({ name, pin, color })
    if (!error) fetchChildren()
    return error
  }, [fetchChildren])

  const updateChild = useCallback(async (id, updates) => {
    const { error } = await supabase.from('children').update(updates).eq('id', id)
    if (!error) fetchChildren()
    return error
  }, [fetchChildren])

  const deleteChild = useCallback(async (id) => {
    const { error } = await supabase.from('children').delete().eq('id', id)
    if (!error) fetchChildren()
    return error
  }, [fetchChildren])

  return { children, loading, addChild, updateChild, deleteChild, refetch: fetchChildren }
}
