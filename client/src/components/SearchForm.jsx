function SearchForm({ searchTerm, onSearchTermChange, onSubmit, onClear }) {
  return (
    <form className="search-form" onSubmit={onSubmit}>
      <input
        type="text"
        value={searchTerm}
        onChange={(event) => onSearchTermChange(event.target.value)}
        placeholder="Search by title..."
      />
      <button type="submit">Search</button>
      <button type="button" onClick={onClear}>
        Clear
      </button>
    </form>
  )
}

export default SearchForm