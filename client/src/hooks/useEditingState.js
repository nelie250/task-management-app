import { useState } from "react";

export function useEditingState() {
  const [editingTaskId, setEditingTaskId] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDueDate, setEditingDueDate] = useState("");
  const [editingPriority, setEditingPriority] = useState("medium");

  const startEditing = (task) => {
    setEditingTaskId(task._id);
    setEditingTitle(task.title);
    setEditingDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
    setEditingPriority(task.priority || "medium");
  };

  const cancelEditing = () => {
    setEditingTaskId("");
    setEditingTitle("");
    setEditingDueDate("");
    setEditingPriority("medium");
  };

  return {
    editingTaskId,
    editingTitle,
    setEditingTitle,
    editingDueDate,
    setEditingDueDate,
    editingPriority,
    setEditingPriority,
    startEditing,
    cancelEditing,
  };
}
