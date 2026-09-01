const formatDate = (dateValue) => {
  if (!dateValue) {
    return 'No due date'
  }

  try {
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  } catch (error) {
    return 'Invalid date'
  }
}

function TaskItem({
  task,
  isEditing,
  editingTitle,
  editingDueDate,
  editingPriority,
  onEditingTitleChange,
  onEditingDueDateChange,
  onEditingPriorityChange,
  onToggle,
  onStartEditing,
  onSave,
  onCancel,
  onDelete,
}) {
  if (!task) {
    return null
  }

  const handleSave = () => {
    if (!editingTitle.trim()) {
      alert('Task title cannot be empty')
      return
    }
    onSave(task._id)
  }

  return (
    <li 
      className={task.completed ? 'task completed' : 'task'}
      data-taskid={task._id}
    >
      {isEditing ? (
        <>
          <div className="edit-fields">
            <input
              type="text"
              value={editingTitle}
              onChange={(event) => onEditingTitleChange(event.target.value)}
              className="edit-input"
              placeholder="Task title"
              aria-label="Edit task title"
              maxLength="120"
              required
            />
            <input
              type="date"
              value={editingDueDate}
              onChange={(event) => onEditingDueDateChange(event.target.value)}
              className="edit-input"
              aria-label="Edit due date"
            />
            <select
              value={editingPriority}
              onChange={(event) => onEditingPriorityChange(event.target.value)}
              className="edit-input"
              aria-label="Edit priority"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="task-actions">
            <button 
              type="button" 
              onClick={handleSave}
              className="save-btn"
              aria-label="Save task changes"
            >
              Save
            </button>
            <button 
              type="button" 
              onClick={onCancel}
              className="cancel-btn"
              aria-label="Cancel editing"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <button 
            type="button" 
            onClick={() => onToggle(task._id)}
            className="toggle-btn"
            aria-label={task.completed ? `Mark \"${task.title}\" as incomplete` : `Mark \"${task.title}\" as complete`}
            title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {task.completed ? '✓' : '○'}
          </button>
          <div className="task-content">
            <span className="task-title">{task.title}</span>
            <small className="task-meta">
              <span className="due-date">{formatDate(task.dueDate)}</span>
              <span className={`priority priority-${task.priority}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </small>
          </div>
          <div className="task-actions">
            <button 
              type="button" 
              onClick={() => onStartEditing(task)}
              className="edit-btn"
              aria-label={`Edit \"${task.title}\"`}
            >
              Edit
            </button>
            <button 
              type="button" 
              onClick={() => onDelete(task._id)}
              className="delete-btn"
              aria-label={`Delete \"${task.title}\"`}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </li>
  )
}

export default TaskItem