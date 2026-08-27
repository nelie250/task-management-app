const formatDate = (dateValue) => {
  if (!dateValue) {
    return 'No due date'
  }

  return new Date(dateValue).toLocaleDateString()
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
  return (
    <li className={task.completed ? 'task completed' : 'task'}>
      {isEditing ? (
        <>
          <div className="edit-fields">
            <input
              type="text"
              value={editingTitle}
              onChange={(event) => onEditingTitleChange(event.target.value)}
              className="edit-input"
            />
            <input
              type="date"
              value={editingDueDate}
              onChange={(event) => onEditingDueDateChange(event.target.value)}
              className="edit-input"
            />
            <select
              value={editingPriority}
              onChange={(event) => onEditingPriorityChange(event.target.value)}
              className="edit-input"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="task-actions">
            <button type="button" onClick={() => onSave(task._id)}>
              Save
            </button>
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <button type="button" onClick={() => onToggle(task._id)}>
            {task.completed ? 'Undo' : 'Done'}
          </button>
          <div className="task-content">
            <span>{task.title}</span>
            <small>{formatDate(task.dueDate)} - Priority: {task.priority}</small>
          </div>
          <div className="task-actions">
            <button type="button" onClick={() => onStartEditing(task)}>
              Edit
            </button>
            <button type="button" onClick={() => onDelete(task._id)}>
              Delete
            </button>
          </div>
        </>
      )}
    </li>
  )
}

export default TaskItem