import React from 'react';
import { useAppContext } from '../contexts/AppContext';

export const Sidebar: React.FC = () => {
  const { universities, selectedUniversityId, selectUniversity } = useAppContext();

  return (
    <nav>
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-4 uppercase">Universities</h2>
        <ul>
          <li>
            <button
              onClick={() => selectUniversity(null)}
              className={`w-full text-left p-2 mb-1 transition-colors uppercase font-semibold ${
                selectedUniversityId === null
                  ? 'bg-black text-white'
                  : 'hover:bg-yellow-300'
              }`}
            >
              All Schools
            </button>
          </li>
          {universities.map((uni) => (
            <li key={uni.id}>
              <button
                onClick={() => selectUniversity(uni.id)}
                className={`w-full text-left p-2 mb-1 transition-colors ${
                  selectedUniversityId === uni.id
                    ? 'bg-black text-white'
                    : 'hover:bg-yellow-300'
                }`}
              >
                {uni.abbreviation} - {uni.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};