import { useEffect, useState } from "react";

const readDraftFromStorage = () => {
  try {
    const storedDraft = localStorage.getItem("taskDraft");
    if (!storedDraft) {
      return { title: "", dueDate: "", priority: "medium" };
    }

    const parsedDraft = JSON.parse(storedDraft);
    return {
      title: parsedDraft.title || "",
      dueDate: parsedDraft.dueDate || "",
      priority: parsedDraft.priority || "medium",
    };
  } catch {
    return { title: "", dueDate: "", priority: "medium" };
  }
};

export function useDraftState() {
  const initialDraft = readDraftFromStorage();
  const [title, setTitle] = useState(initialDraft.title);
  const [dueDate, setDueDate] = useState(initialDraft.dueDate);
  const [priority, setPriority] = useState(initialDraft.priority);

  // Save draft to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "taskDraft",
      JSON.stringify({
        title,
        dueDate,
        priority,
      }),
    );
  }, [title, dueDate, priority]);

  const clearDraft = () => {
    setTitle("");
    setDueDate("");
    setPriority("medium");
  };

  return {
    title,
    setTitle,
    dueDate,
    setDueDate,
    priority,
    setPriority,
    clearDraft,
  };
}
