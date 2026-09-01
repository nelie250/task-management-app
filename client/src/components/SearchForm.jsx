function SearchForm({ searchTerm, onSearchTermChange, onSubmit, onClear }) {
  return (
    <form className="search-form" onSubmit={onSubmit}>
      <div className="search-input-wrapper">
        <label htmlFor="search-input">Search tasks</label>
        <input
          id="search-input"
          type="text"
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder="Search by title..."
          aria-label="Search tasks by title"
          maxLength="100"
        />
      </div>
      <div className="search-actions">
        <button type="submit" className="search-btn" aria-label="Search for tasks">
          Search
        </button>
        <button 
          type="button" 
          onClick={onClear}
          className="clear-btn"
          disabled={!searchTerm}
          aria-label="Clear search"
          title="Clear search filter"
        >
          Clear
        </button>
      </div>
    </form>
  )
}

export default SearchForm