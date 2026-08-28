function TaskForm({ title, dueDate, priority, onTitleChange, onDueDateChange, onPriorityChange, onSubmit }) {
  return (
    <form className="task-form" onSubmit={onSubmit}>
      <input
        type="text"
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder="Write a task..."
      />
      <input
        type="date"
        value={dueDate}
        onChange={(event) => onDueDateChange(event.target.value)}
      />
      <select value={priority} onChange={(event) => onPriorityChange(event.target.value)}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <button type="submit">Add Task</button>
    </form>
  )
}

export default TaskForm