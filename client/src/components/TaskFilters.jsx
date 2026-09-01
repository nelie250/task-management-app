function TaskFilters({ filter, onFilterChange }) {
  return (
    <div className="filters" role="group" aria-label="Task filters">
      {['all', 'active', 'completed'].map((filterOption) => (
        <button
          key={filterOption}
          type="button"
          className={filter === filterOption ? 'active-filter' : 'filter-btn'}
          onClick={() => onFilterChange(filterOption)}
          aria-pressed={filter === filterOption}
          aria-label={`Filter by ${filterOption} tasks`}
          title={`Show ${filterOption} tasks`}
        >
          {filterOption[0].toUpperCase() + filterOption.slice(1)}
        </button>
      ))}
    </div>
  )
}

export default TaskFilters