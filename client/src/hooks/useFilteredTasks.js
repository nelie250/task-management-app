import { useEffect, useState } from "react";

export function filterTasks(
  tasks = [],
  currentFilter = "all",
  searchText = "",
) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const normalizedFilter = currentFilter || "all";
  const searchValue = String(searchText ?? "")
    .trim()
    .toLowerCase();

  return safeTasks.filter((task) => {
    if (!task || typeof task !== "object") {
      return false;
    }

    const taskTitle = String(task.title ?? "");
    const matchesSearch = taskTitle.toLowerCase().includes(searchValue);

    if (!matchesSearch) {
      return false;
    }

    if (normalizedFilter === "active") {
      return !Boolean(task.completed);
    }

    if (normalizedFilter === "completed") {
      return Boolean(task.completed);
    }

    return true;
  });
}

export function useFilteredTasks(tasks, initialFilter = "all") {
  const [filter, setFilter] = useState(() => {
    try {
      return localStorage.getItem("taskFilter") || initialFilter;
    } catch {
      return initialFilter;
    }
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("taskFilter", filter);
    } catch {
      // Ignore storage failures in restricted environments.
    }
  }, [filter]);

  const filteredTasks = filterTasks(tasks, filter, searchTerm);

  return { filter, setFilter, searchTerm, setSearchTerm, filteredTasks };
}
