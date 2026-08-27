import TaskItem from './TaskItem.jsx'

function TaskList({
  tasks,
  editingTaskId,
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
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          isEditing={editingTaskId === task._id}
          editingTitle={editingTitle}
          editingDueDate={editingDueDate}
          editingPriority={editingPriority}
          onEditingTitleChange={onEditingTitleChange}
          onEditingDueDateChange={onEditingDueDateChange}
          onEditingPriorityChange={onEditingPriorityChange}
          onToggle={onToggle}
          onStartEditing={onStartEditing}
          onSave={onSave}
          onCancel={onCancel}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}

export default TaskList