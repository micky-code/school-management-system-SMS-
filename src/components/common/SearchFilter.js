import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SearchFilter = ({ onSearch, filters }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState({});

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterValues({
      ...filterValues,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      search: searchTerm,
      ...filterValues
    });
  };

  const handleReset = () => {
    setSearchTerm('');
    setFilterValues({});
    onSearch({});
  };

  return (
    <div className="mb-6 bg-white p-4 rounded-lg shadow">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
          {/* Search input */}
          <div className="flex-1">
            <label htmlFor="search" className="form-label">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                id="search"
                name="search"
                value={searchTerm}
                onChange={handleSearchChange}
                className="form-input pl-10"
                placeholder="Search..."
              />
            </div>
          </div>

          {/* Filter dropdowns */}
          {filters && filters.map((filter) => (
            <div key={filter.name} className="w-full md:w-auto">
              <label htmlFor={filter.name} className="form-label">
                {filter.label}
              </label>
              <select
                id={filter.name}
                name={filter.name}
                value={filterValues[filter.name] || ''}
                onChange={handleFilterChange}
                className="form-input"
              >
                <option value="">All</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Buttons */}
          <div className="flex space-x-2">
            <button type="submit" className="btn-primary">
              Search
            </button>
            <button type="button" onClick={handleReset} className="btn-secondary">
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchFilter;
