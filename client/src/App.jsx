import { useEffect, useRef, useState } from 'react'
import './App.css'
import TaskFilters from './components/TaskFilters.jsx'
import TaskForm from './components/TaskForm.jsx'
import TaskList from './components/TaskList.jsx'
import SearchForm from './components/SearchForm.jsx'
import { useTasks } from './hooks/useTasks.js'
import { useDraftState } from './hooks/useDraftState.js'
import { useEditingState } from './hooks/useEditingState.js'
import { useFilteredTasks } from './hooks/useFilteredTasks.js'
import { logoutUser, loginUser, registerUser } from './services/taskApi.js'

function App() {
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ 
    name: '', 
    username: '', 
    email: '',
    password: '', 
    confirmPassword: ''
  })
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
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('taskRefreshToken') || '')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef(null)

  const { tasks, loading, error, loadTasks, addTask, toggleTask, updateTask, deleteTask } = useTasks()
  const { title, setTitle, dueDate, setDueDate, priority, setPriority, clearDraft } = useDraftState()
  const { editingTaskId, editingTitle, setEditingTitle, editingDueDate, setEditingDueDate, editingPriority, setEditingPriority, startEditing, cancelEditing } = useEditingState()
  const { filter, setFilter, searchTerm, setSearchTerm, filteredTasks } = useFilteredTasks(tasks)

  // Load tasks when token changes
  useEffect(() => {
    if (token) {
      loadTasks('')
    }
  }, [token, loadTasks])

  useEffect(() => {
    if (!deleteConfirm) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !isDeleting) setDeleteConfirm(null)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [deleteConfirm, isDeleting])

  useEffect(() => {
    const closeAccountMenu = (event) => {
      if (event.key === 'Escape') setIsAccountMenuOpen(false)
    }

    const closeOnOutsideClick = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false)
      }
    }

    window.addEventListener('keydown', closeAccountMenu)
    window.addEventListener('mousedown', closeOnOutsideClick)
    return () => {
      window.removeEventListener('keydown', closeAccountMenu)
      window.removeEventListener('mousedown', closeOnOutsideClick)
    }
  }, [])

  const handleAuthChange = (field, value) => {
    setAuthForm((current) => ({ ...current, [field]: value }))
    // Clear error when user starts typing
    setAuthError('')
  }

  const validateRegistration = () => {
    const { name, username, email, password, confirmPassword } = authForm
    
    if (!name.trim() || !username.trim() || !email.trim() || !password || !confirmPassword) {
      setAuthError('All fields are required')
      return false
    }

    if (username.length < 3 || username.length > 30) {
      setAuthError('Username must be between 3 and 30 characters')
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAuthError('Please enter a valid email address')
      return false
    }

    if (password.length < 8) {
      setAuthError('Password must be at least 8 characters')
      return false
    }

    if (!/[A-Z]/.test(password)) {
      setAuthError('Password must contain at least one uppercase letter')
      return false
    }

    if (!/[a-z]/.test(password)) {
      setAuthError('Password must contain at least one lowercase letter')
      return false
    }

    if (!/[0-9]/.test(password)) {
      setAuthError('Password must contain at least one number')
      return false
    }

    if (!/[!@#$%^&*]/.test(password)) {
      setAuthError('Password must contain at least one special character (!@#$%^&*)')
      return false
    }

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match')
      return false
    }

    return true
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    try {
      if (authMode === 'register') {
        if (!validateRegistration()) {
          setAuthLoading(false)
          return
        }

        const payload = {
          name: authForm.name.trim(),
          username: authForm.username.trim(),
          email: authForm.email.trim(),
          password: authForm.password,
          confirmPassword: authForm.confirmPassword,
        }

        const response = await registerUser(payload)
        setUser(response.user)
        setToken(localStorage.getItem('taskAuthToken') || '')
        setRefreshToken(localStorage.getItem('taskRefreshToken') || '')
        setAuthForm({ name: '', username: '', email: '', password: '', confirmPassword: '' })
      } else {
        if (!authForm.username.trim() || !authForm.password) {
          setAuthError('Username and password are required')
          setAuthLoading(false)
          return
        }

        const payload = {
          username: authForm.username.trim(),
          password: authForm.password,
        }

        const response = await loginUser(payload)
        setUser(response.user)
        setToken(localStorage.getItem('taskAuthToken') || '')
        setRefreshToken(localStorage.getItem('taskRefreshToken') || '')
        setAuthForm({ name: '', username: '', email: '', password: '', confirmPassword: '' })
      }
    } catch (requestError) {
      setAuthError(requestError.message || 'Authentication failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    await logoutUser(refreshToken)
    setUser(null)
    setToken('')
    setRefreshToken('')
    setAuthForm({ name: '', username: '', email: '', password: '', confirmPassword: '' })
    setAuthMode('login')
    setDeleteConfirm(null)
    setIsAccountMenuOpen(false)
  }

  const handleAddTask = async (event) => {
    event.preventDefault()

    if (!title.trim()) {
      alert('Please enter a task title')
      return
    }

    const createdTask = await addTask({
      title: title.trim(),
      dueDate,
      priority,
    })

    if (createdTask) clearDraft()
  }

  const handleSearch = async (event) => {
    event.preventDefault()
    await loadTasks(searchTerm)
  }

  const handleSaveEdit = async (taskId) => {
    if (!editingTitle.trim()) {
      alert('Task title cannot be empty')
      return
    }

    const updatedTask = await updateTask(taskId, {
      title: editingTitle.trim(),
      dueDate: editingDueDate,
      priority: editingPriority,
    })

    if (updatedTask) cancelEditing()
  }

  const confirmDelete = async (taskId) => {
    setIsDeleting(true)
    await deleteTask(taskId)
    setIsDeleting(false)
    setDeleteConfirm(null)
  }

  const totalTasks = tasks.length
  const activeTasks = tasks.filter((task) => !task.completed).length
  const completedTasks = tasks.filter((task) => task.completed).length
  const taskPendingDeletion = tasks.find((task) => task._id === deleteConfirm)
  const displayName = String(user?.name || user?.username || '').trim()
  const userInitial = displayName.charAt(0).toUpperCase() || 'U'

  if (!token || !user) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <div className="auth-header">
            <p className="eyebrow">Welcome</p>
            <h1>{authMode === 'login' ? 'Sign in' : 'Create account'}</h1>
          </div>

          <div className="auth-toggle" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={authMode === 'login'}
              className={authMode === 'login' ? 'auth-toggle-button active' : 'auth-toggle-button'}
              onClick={() => {
                setAuthMode('login')
                setAuthError('')
              }}
            >
              Login
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={authMode === 'register'}
              className={authMode === 'register' ? 'auth-toggle-button active' : 'auth-toggle-button'}
              onClick={() => {
                setAuthMode('register')
                setAuthError('')
              }}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="auth-form" noValidate>
            {authMode === 'register' && (
              <label htmlFor="name">
                <span>Name</span>
                <input
                  id="name"
                  type="text"
                  value={authForm.name}
                  placeholder="Your full name"
                  onChange={(event) => handleAuthChange('name', event.target.value)}
                  required
                  disabled={authLoading}
                />
              </label>
            )}

            <label htmlFor="username">
              <span>Username</span>
              <input
                id="username"
                type="text"
                value={authForm.username}
                placeholder={authMode === 'login' ? 'Enter your username' : 'Choose a username (3-30 characters)'}
                onChange={(event) => handleAuthChange('username', event.target.value)}
                required
                disabled={authLoading}
              />
            </label>

            {authMode === 'register' && (
              <label htmlFor="email">
                <span>Email</span>
                <input
                  id="email"
                  type="email"
                  value={authForm.email}
                  placeholder="your.email@example.com"
                  onChange={(event) => handleAuthChange('email', event.target.value)}
                  required
                  disabled={authLoading}
                />
              </label>
            )}

            <label htmlFor="password">
              <span>Password</span>
              <input
                id="password"
                type="password"
                value={authForm.password}
                placeholder={authMode === 'login' ? 'Enter your password' : 'Strong password (min 8 chars, uppercase, lowercase, number, special char)'}
                onChange={(event) => handleAuthChange('password', event.target.value)}
                required
                disabled={authLoading}
              />
            </label>

            {authMode === 'register' && (
              <label htmlFor="confirmPassword">
                <span>Confirm Password</span>
                <input
                  id="confirmPassword"
                  type="password"
                  value={authForm.confirmPassword}
                  placeholder="Confirm your password"
                  onChange={(event) => handleAuthChange('confirmPassword', event.target.value)}
                  required
                  disabled={authLoading}
                />
              </label>
            )}

            {authError && <p className="auth-error" role="alert">{authError}</p>}

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
        <div className="brand-block">
          <p className="eyebrow">Your workspace</p>
          <h1>Task Flow</h1>
          <p className="subtitle">Keep your day clear, focused, and moving forward.</p>
        </div>

        <div className="account-menu" ref={accountMenuRef}>
          <button
            type="button"
            className="avatar-button"
            onClick={() => setIsAccountMenuOpen((open) => !open)}
            aria-label="Open account menu"
            aria-expanded={isAccountMenuOpen}
            aria-haspopup="menu"
          >
            <span aria-hidden="true">{userInitial}</span>
          </button>
          {isAccountMenuOpen && (
            <div className="account-popover" role="menu">
              <div className="account-identity">
                <span className="account-avatar" aria-hidden="true">{userInitial}</span>
                <div>
                  <strong>{displayName}</strong>
                  <span>@{user.username}</span>
                </div>
              </div>
              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
                role="menuitem"
              >
                Log out
              </button>
            </div>
          )}
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
        />
        <TaskFilters filter={filter} onFilterChange={setFilter} />
      </div>

      {deleteConfirm && (
        <div
          className="delete-confirmation"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting) setDeleteConfirm(null)
          }}
        >
          <section
            className="confirmation-content"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
            aria-describedby="delete-confirm-description"
          >
            <div className="confirmation-icon" aria-hidden="true">!</div>
            <p className="confirmation-kicker">Permanent action</p>
            <h2 id="delete-confirm-title">Delete this task?</h2>
            <p id="delete-confirm-description">
              {taskPendingDeletion ? <>“{taskPendingDeletion.title}” will be permanently removed.</> : 'This task will be permanently removed.'}
            </p>
            <div className="confirmation-buttons">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="cancel-btn"
                disabled={isDeleting}
                autoFocus
              >
                Keep task
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(deleteConfirm)}
                className="delete-btn"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting…' : 'Delete task'}
              </button>
            </div>
          </section>
        </div>
      )}

      {error && <p className="error" role="alert">{error}</p>}

      {loading ? (
        <p className="loading-state" aria-busy="true">Loading tasks...</p>
      ) : filteredTasks.length === 0 ? (
        <p className="empty-state">
          {searchTerm ? 'No tasks match your search.' : 'No tasks yet. Create one to get started!'}
        </p>
      ) : (
        <>
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
            onDelete={(taskId) => setDeleteConfirm(taskId)}
          />
        </>
      )}
    </main>
  )
}

export default App
