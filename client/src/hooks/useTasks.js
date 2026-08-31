import { useEffect, useState } from "react";
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

  const loadTasks = async (query = "") => {
    try {
      setError("");
      const data = await getTasks(query);
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData) => {
    try {
      setError("");
      setLoading(true);
      await createTask(taskData);
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleTask = async (taskId) => {
    try {
      setError("");
      setLoading(true);
      await toggleTaskById(taskId);
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      setError("");
      setLoading(true);
      await updateTaskById(taskId, taskData);
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setError("");
      setLoading(true);
      await deleteTaskById(taskId);
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    let isActive = true;

    const fetchInitialTasks = async () => {
      try {
        const data = await getTasks();
        if (isActive) {
          setTasks(data);
        }
      } catch (err) {
        if (isActive) {
          setError(err.message);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchInitialTasks();

    return () => {
      isActive = false;
    };
  }, []);

  return {
    tasks,
    loading,
    error,
    loadTasks,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
  };
}
