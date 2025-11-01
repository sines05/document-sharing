import React, { useState, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { SearchBar } from './SearchBar';
import { UploadIcon } from './icons/UploadIcon';
import { useAppContext } from '../contexts/AppContext';
import { SearchSuggestions } from './SearchSuggestions';
import { useOnClickOutside } from '../hooks/useClickOutside';

interface HeaderProps {
  onUploadClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onUploadClick }) => {
  const { searchTerm, setSearchTerm } = useAppContext();
  const location = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);

  const [showSuggestions, setShowSuggestions] = useState(false);

  useOnClickOutside(searchRef, () => setShowSuggestions(false));

  const isReviewsPage = location.pathname.startsWith('/reviews');

  const placeholder = isReviewsPage
    ? "Search lecturers, courses, reviews..."
    : "Search documents, courses...";
    
  // Search suggestions are disabled for now as they depended on globally loaded data.
  // This can be re-implemented by fetching suggestions from a dedicated API endpoint.
  const suggestions = { lecturers: [], courses: [] };

  const handleSuggestionClick = (suggestionText: string) => {
    setSearchTerm(suggestionText);
    setShowSuggestions(false);
  };

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 px-4 border-b-2 border-black gap-4">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter uppercase">
        VNU Docs Hub
      </h1>
      <div className="flex items-baseline gap-2 w-full sm:w-auto">
        <div 
          ref={searchRef} 
          className="relative w-full sm:w-auto"
          onFocus={() => setShowSuggestions(true)}
        >
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder={placeholder} />
          {showSuggestions && isReviewsPage && searchTerm.length > 0 && (
             <SearchSuggestions 
                suggestions={suggestions} 
                onSuggestionClick={handleSuggestionClick} 
                searchTerm={searchTerm} 
              />
          )}
        </div>
        <button
            onClick={onUploadClick}
            className="relative top-0.5 h-11 flex items-center justify-center gap-2 px-4 bg-blue-500 text-white border-2 border-black font-bold uppercase hover:bg-blue-600 active:bg-blue-700 transition-all duration-200 ease-in-out hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
            style={{ boxShadow: '2px 2px 0px #000' }}
            aria-label="Upload document"
        >
            <UploadIcon />
            <span className="hidden md:inline">Upload</span>
        </button>
      </div>
    </header>
  );
};