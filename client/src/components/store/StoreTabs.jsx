import React from 'react';

const StoreTabs = ({ active, onChange, tabs }) => {
  return (
    <div className="border-b">
      <nav className="flex gap-4" aria-label="Tabs">
        {tabs.map(t => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={
                "py-3 -mb-px border-b-2 text-sm md:text-base " +
                (isActive
                  ? "border-blue-600 text-blue-700 font-medium"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300")
              }
            >
              {t.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default StoreTabs;
