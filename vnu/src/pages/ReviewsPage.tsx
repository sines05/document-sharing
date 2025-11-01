import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReviewSection } from '../components/ReviewSection';
import { Pagination } from '../components/Pagination';
import { Tabs } from '../components/Tabs';
import { useAppContext } from '../contexts/AppContext';
import { AdvancedSearchPanel } from '../components/AdvancedSearchPanel';
import { ActiveFilters } from '../components/ActiveFilters';
import { FilterIcon } from '../components/icons/FilterIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import { api } from '../services/api';
import type { Lecturer, AdvancedSearchFilters, Review, Comment } from '../types';

const LECTURERS_PER_PAGE = 5;

interface ReviewsPageContext {
  handleOpenPostReviewModal: () => void;
}

// The data structure returned by our RPC call
interface LecturerWithReviews {
  lecturerId: number;
  lecturerName: string;
  universityId: string;
  reviews: Review[];
}

export const ReviewsPage: React.FC = () => {
  const { universities, selectedUniversityId, searchTerm } = useAppContext();
  const { handleOpenPostReviewModal } = useOutletContext<ReviewsPageContext>();
  
  const [loading, setLoading] = useState(true);
  const [reviewsData, setReviewsData] = useState<LecturerWithReviews[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [advancedSearchFilters, setAdvancedSearchFilters] = useState<AdvancedSearchFilters>({
    lecturer: '',
    course: '',
    content: '',
  });

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      // The backend now handles all filtering and searching.
      const data = await api.getReviews(selectedUniversityId, searchTerm);
      setReviewsData(data || []); // Ensure data is an array
    } catch (error) {
      console.error("Failed to fetch reviews", error);
      setReviewsData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedUniversityId, searchTerm]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Pagination is now client-side since the API returns all matching lecturers.
  const totalPages = Math.ceil(reviewsData.length / LECTURERS_PER_PAGE);
  const paginatedData = reviewsData.slice(
    (currentPage - 1) * LECTURERS_PER_PAGE,
    currentPage * LECTURERS_PER_PAGE
  );

  const handleAddComment = (reviewId: number, content: string) => {
    // This needs to be implemented with a call to a new API endpoint
    console.log('Adding comment:', { reviewId, content });
  };

  const handleClearFilter = (filterToClear: keyof AdvancedSearchFilters) => {
    setAdvancedSearchFilters(prev => ({ ...prev, [filterToClear]: '' }));
  };

  const handleClearAllFilters = () => {
    setAdvancedSearchFilters({ lecturer: '', course: '', content: '' });
  };
  
  if (loading) {
    return <div className="text-center p-10">Loading reviews...</div>;
  }

  // Reshape the data for the ReviewSection component
  const formattedData = paginatedData.map(item => ({
    lecturer: {
      id: item.lecturerId,
      name: item.lecturerName,
      universityId: item.universityId,
    },
    reviews: item.reviews,
  }));

  return (
    <>
      <Tabs />
      <div className="my-6 flex flex-col sm:flex-row gap-4">
          <button
              onClick={handleOpenPostReviewModal}
              className="w-full sm:w-auto flex-grow flex items-center justify-center gap-2 p-3 bg-blue-500 text-white border-2 border-black font-bold uppercase hover:bg-blue-600 active:bg-blue-700 transition-all duration-200 ease-in-out hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
              style={{ boxShadow: '4px 4px 0px #000' }}
          >
              <PlusIcon />
              Post a Review
          </button>
          <button
              onClick={() => setIsFilterPanelOpen(prev => !prev)}
              className={`w-full sm:w-auto p-3 border-2 border-black font-bold uppercase flex items-center justify-center gap-2 transition-colors ${isFilterPanelOpen ? 'bg-black text-yellow-300' : 'bg-white hover:bg-yellow-300'}`}
              style={!isFilterPanelOpen ? { boxShadow: '4px 4px 0px #000' } : {}}
              aria-expanded={isFilterPanelOpen}
          >
              <FilterIcon />
              {isFilterPanelOpen ? 'Hide Filters' : 'Show Filters'}
          </button>
      </div>

      {isFilterPanelOpen && (
        <AdvancedSearchPanel
          filters={advancedSearchFilters}
          onFilterChange={setAdvancedSearchFilters}
          onClear={handleClearAllFilters}
        />
      )}

      <ActiveFilters filters={advancedSearchFilters} onClearFilter={handleClearFilter} />

      <ReviewSection
          data={formattedData}
          comments={[]} // Comments are now nested inside reviews
          universities={universities}
          onAddComment={handleAddComment}
      />
      <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
      />
    </>
  );
};