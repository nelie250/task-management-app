import { useEffect, useState } from 'react'
import './App.css'
import TaskFilters from './components/TaskFilters.jsx'
import TaskForm from './components/TaskForm.jsx'
import TaskList from './components/TaskList.jsx'
import SearchForm from './components/SearchForm.jsx'
import { useTasks } from './hooks/useTasks.js'
import { useDraftState } from './hooks/useDraftState.js'
import { useEditingState } from './hooks/useEditingState.js'
import { useFilteredTasks } from './hooks/useFilteredTasks.js'
import { clearSession, loginUser, registerUser } from './services/taskApi.js'

function App() {
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ name: '', username: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('taskUser')
      return storedUser ? JSON.parse(storedUser) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('taskAuthToken') || '')

  const { tasks, loading, error, loadTasks, addTask, toggleTask, updateTask, deleteTask } = useTasks()
  const { title, setTitle, dueDate, setDueDate, priority, setPriority, clearDraft } = useDraftState()
  const { editingTaskId, editingTitle, setEditingTitle, editingDueDate, setEditingDueDate, editingPriority, setEditingPriority, startEditing, cancelEditing } = useEditingState()
  const { filter, setFilter, searchTerm, setSearchTerm, filteredTasks } = useFilteredTasks(tasks)

  useEffect(() => {
    if (token) {
      loadTasks('')
    }
  }, [token, loadTasks])

  const handleAuthChange = (field, value) => {
    setAuthForm((current) => ({ ...current, [field]: value }))
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    try {
      const payload = {
        ...(authMode === 'register' ? { name: authForm.name.trim() } : {}),
        username: authForm.username.trim(),
        password: authForm.password,
      }

      const response =
        authMode === 'login'
          ? await loginUser(payload)
          : await registerUser(payload)

      setUser(response.user)
      setToken(localStorage.getItem('taskAuthToken') || '')
    } catch (requestError) {
      setAuthError(requestError.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    clearSession()
    setUser(null)
    setToken('')
    setAuthForm({ name: '', username: '', password: '' })
    setAuthMode('login')
  }

  const handleAddTask = async (event) => {
    event.preventDefault()

    if (!title.trim()) {
      return
    }

    await addTask({
      title: title.trim(),
      dueDate,
      priority,
    })

    clearDraft()
  }

  const handleSearch = async (event) => {
    event.preventDefault()
    await loadTasks(searchTerm)
  }

  const handleClearSearch = async () => {
    setSearchTerm('')
    await loadTasks('')
  }

  const handleSaveEdit = async (taskId) => {
    if (!editingTitle.trim()) {
      return
    }

    await updateTask(taskId, {
      title: editingTitle.trim(),
      dueDate: editingDueDate,
      priority: editingPriority,
    })

    cancelEditing()
  }

  const totalTasks = tasks.length
  const activeTasks = tasks.filter((task) => !task.completed).length
  const completedTasks = tasks.filter((task) => task.completed).length

  if (!token || !user) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <div className="auth-header">
            <p className="eyebrow">Welcome</p>
            <h1>{authMode === 'login' ? 'Sign in' : 'Create account'}</h1>
          </div>

          <div className="auth-toggle" aria-label="Authentication mode switcher">
            <button
              type="button"
              className={authMode === 'login' ? 'auth-toggle-button active' : 'auth-toggle-button'}
              onClick={() => setAuthMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={authMode === 'register' ? 'auth-toggle-button active' : 'auth-toggle-button'}
              onClick={() => setAuthMode('register')}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="auth-form">
            {authMode === 'register' && (
              <label>
                <span>Name</span>
                <input
                  type="text"
                  value={authForm.name}
                  placeholder="Your name"
                  onChange={(event) => handleAuthChange('name', event.target.value)}
                />
              </label>
            )}

            <label>
              <span>Username</span>
              <input
                type="text"
                value={authForm.username}
                placeholder={authMode === 'login' ? 'Enter your username' : 'Choose a username'}
                onChange={(event) => handleAuthChange('username', event.target.value)}
              />
            </label>

            <label>
              <span>Password</span>
              <input
                type="password"
                value={authForm.password}
                placeholder="Enter your password"
                onChange={(event) => handleAuthChange('password', event.target.value)}
              />
            </label>

            {authError && <p className="auth-error">{authError}</p>}

            <button type="submit" className="auth-submit" disabled={authLoading}>
              {authLoading ? 'Please wait...' : authMode === 'login' ? 'Login' : 'Register'}
            </button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Full-Stack Task Management System</p>
          <h1>Task Flow</h1>
        </div>

        <div className="user-panel">
          <span>Welcome, {user.name || user.username}</span>
          <button type="button" className="logout-button" onClick={handleLogout}>Logout</button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <strong>{totalTasks}</strong>
            <span>Total</span>
          </div>
          <div className="stat-card">
            <strong>{activeTasks}</strong>
            <span>Active</span>
          </div>
          <div className="stat-card">
            <strong>{completedTasks}</strong>
            <span>Done</span>
          </div>
        </div>
      </header>

      <p className="subtitle">React + Node + MongoDB workspace for planning, tracking, and completing work efficiently.</p>

      <TaskForm
        title={title}
        dueDate={dueDate}
        priority={priority}
        onTitleChange={setTitle}
        onDueDateChange={setDueDate}
        onPriorityChange={setPriority}
        onSubmit={handleAddTask}
      />

      <div className="toolbar">
        <SearchForm
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSubmit={handleSearch}
          onClear={handleClearSearch}
        />
        <TaskFilters filter={filter} onFilterChange={setFilter} />
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p className="loading-state">Loading tasks...</p>
      ) : (
        <TaskList
          tasks={filteredTasks}
          editingTaskId={editingTaskId}
          editingTitle={editingTitle}
          editingDueDate={editingDueDate}
          editingPriority={editingPriority}
          onEditingTitleChange={setEditingTitle}
          onEditingDueDateChange={setEditingDueDate}
          onEditingPriorityChange={setEditingPriority}
          onToggle={toggleTask}
          onStartEditing={startEditing}
          onSave={handleSaveEdit}
          onCancel={cancelEditing}
          onDelete={deleteTask}
        />
      )}
    </main>
  )
}

export default App
