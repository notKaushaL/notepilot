import React from 'react';

const TimeFilter = ({ selectedFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'today', label: 'Today' },
    { id: 'thisWeek', label: 'This Week' },
    { id: 'thisMonth', label: 'This Month' }
  ];

  return (
    <div className="flex items-center gap-2 bg-gray-800 p-1 rounded-xl border border-gray-600 overflow-x-auto">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 flex-shrink-0 rounded-lg ${
            selectedFilter === filter.id
              ? 'bg-white text-gray-900'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default TimeFilter;
