import { useState, useCallback } from "react";
import {
  createTask,
  deleteTaskById,
  getTasks,
  toggleTaskById,
  updateTaskById,
} from "../services/taskApi.js";

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Memoize loadTasks to prevent infinite re-renders
  const loadTasks = useCallback(async (query = "", page = 1) => {
    try {
      setError("");
      setLoading(true);
      const data = await getTasks(query, page, pagination.limit);
      setTasks(data.tasks || data);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  // Optimistic update for adding task
  const addTask = useCallback(async (taskData) => {
    try {
      setError("");
      // Optimistically add to UI
      const tempTask = {
        ...taskData,
        _id: "temp-" + Date.now(),
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTasks((prev) => [tempTask, ...prev]);

      // Actually create on server
      const created = await createTask(taskData);
      // Replace temp task with real task
      setTasks((prev) =>
        prev.map((t) => (t._id === tempTask._id ? created : t))
      );
      return created;
    } catch (err) {
      setError(err.message);
      // Remove temp task on error
      setTasks((prev) =>
        prev.filter((t) => !t._id.startsWith("temp-"))
      );
      return null;
    }
  }, []);

  // Optimistic update for toggling task
  const toggleTask = useCallback(async (taskId) => {
    try {
      setError("");
      // Optimistically toggle in UI
      setTasks((prev) =>
        prev.map((t) =>
          t._id === taskId ? { ...t, completed: !t.completed } : t
        )
      );

      // Actually update on server
      await toggleTaskById(taskId);
    } catch (err) {
      setError(err.message);
      // Reload if error
      await loadTasks("", pagination.page);
    }
  }, [loadTasks, pagination.page]);

  // Optimistic update for updating task
  const updateTask = useCallback(async (taskId, taskData) => {
    try {
      setError("");
      // Optimistically update in UI
      setTasks((prev) =>
        prev.map((t) =>
          t._id === taskId ? { ...t, ...taskData } : t
        )
      );

      // Actually update on server
      const updated = await updateTaskById(taskId, taskData);
      setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
      return updated;
    } catch (err) {
      setError(err.message);
      // Reload if error
      await loadTasks("", pagination.page);
      return null;
    }
  }, [loadTasks, pagination.page]);

  // Optimistic delete
  const deleteTask = useCallback(async (taskId) => {
    try {
      setError("");
      // Optimistically remove from UI
      setTasks((prev) => prev.filter((t) => t._id !== taskId));

      // Actually delete on server
      await deleteTaskById(taskId);
      // Update pagination if needed
      if (tasks.length === 1 && pagination.page > 1) {
        await loadTasks("", pagination.page - 1);
      }
    } catch (err) {
      setError(err.message);
      // Reload if error
      await loadTasks("", pagination.page);
    }
  }, [loadTasks, pagination.page, tasks.length]);

  return {
    tasks,
    loading,
    error,
    pagination,
    loadTasks,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
  };
}
