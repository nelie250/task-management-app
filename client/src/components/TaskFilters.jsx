function TaskFilters({ filter, onFilterChange }) {
  return (
    <div className="filters">
      {['all', 'active', 'completed'].map((filterOption) => (
        <button
          key={filterOption}
          type="button"
          className={filter === filterOption ? 'active-filter' : ''}
          onClick={() => onFilterChange(filterOption)}
        >
          {filterOption[0].toUpperCase() + filterOption.slice(1)}
        </button>
      ))}
    </div>
  )
}

export default TaskFilters