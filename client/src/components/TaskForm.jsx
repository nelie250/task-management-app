function TaskForm({ title, dueDate, priority, onTitleChange, onDueDateChange, onPriorityChange, onSubmit }) {
  const minDate = new Date().toISOString().split('T')[0]

  return (
    <form className="task-form" onSubmit={onSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="task-title">Task Title</label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Write a new task..."
          maxLength="120"
          aria-label="Task title"
          aria-describedby="title-hint"
          required
        />
        <small id="title-hint" className="form-hint">
          {title.length}/120 characters
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="task-duedate">Due Date</label>
        <input
          id="task-duedate"
          type="date"
          value={dueDate}
          onChange={(event) => onDueDateChange(event.target.value)}
          min={minDate}
          aria-label="Task due date"
          aria-describedby="date-hint"
        />
        <small id="date-hint" className="form-hint">
          Optional - must be today or later
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="task-priority">Priority</label>
        <select 
          id="task-priority"
          value={priority} 
          onChange={(event) => onPriorityChange(event.target.value)}
          aria-label="Task priority"
        >
          <option value="low">Low</option>
          <option value="medium">Medium (Default)</option>
          <option value="high">High</option>
        </select>
      </div>

      <button type="submit" className="submit-btn">
        Add Task
      </button>
    </form>
  )
}

export default TaskForm