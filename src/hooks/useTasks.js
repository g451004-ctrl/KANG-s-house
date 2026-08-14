import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase.from('tasks').select('*').order('created_at')
    if (!error) setTasks(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTasks()
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchTasks])

  const addTask = useCallback(async (task) => {
    const { error } = await supabase.from('tasks').insert(task)
    if (!error) fetchTasks()
    return error
  }, [fetchTasks])

  const updateTask = useCallback(async (id, updates) => {
    const { error } = await supabase.from('tasks').update(updates).eq('id', id)
    if (!error) fetchTasks()
    return error
  }, [fetchTasks])

  const deleteTask = useCallback(async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) fetchTasks()
    return error
  }, [fetchTasks])

  const tasksForChild = useCallback((childId, activeOnly = true) => {
    return tasks.filter(t => t.child_id === childId && (!activeOnly || t.active))
  }, [tasks])

  return { tasks, loading, addTask, updateTask, deleteTask, tasksForChild }
}
