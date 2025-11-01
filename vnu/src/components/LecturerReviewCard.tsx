import React, { useState, useMemo } from 'react';
import type { Lecturer, Review, University, Comment } from '../types';
import { ReviewItem } from './ReviewItem';

interface LecturerReviewCardProps {
    lecturer: Lecturer;
    reviews: Review[];
    university?: University;
    comments: Comment[];
    onAddComment: (reviewId: number, content: string) => void;
}

const REVIEWS_TO_SHOW = 3;

export const LecturerReviewCard: React.FC<LecturerReviewCardProps> = ({ lecturer, reviews, university, comments, onAddComment }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const sortedReviews = useMemo(() => {
        return [...reviews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [reviews]);
    
    const displayedReviews = isExpanded ? sortedReviews : sortedReviews.slice(0, REVIEWS_TO_SHOW);

    return (
        <div className="border-2 border-black bg-white transition-all duration-200 ease-in-out hover:shadow-none hover:translate-x-1 hover:translate-y-1" style={{ boxShadow: '4px 4px 0px #000' }}>
            <div className="p-4 border-b-2 border-black bg-yellow-300">
                <h3 className="text-xl font-bold">{lecturer.name}</h3>
                <p className="text-sm font-semibold uppercase">{university?.name || 'Unknown University'}</p>
            </div>
            <div className="p-4 space-y-4">
                {displayedReviews.length > 0 ? (
                    displayedReviews.map(review => (
                        <ReviewItem 
                            key={review.id}
                            review={review}
                            comments={comments.filter(c => c.reviewId === review.id)}
                            onAddComment={onAddComment}
                        />
                    ))
                ) : (
                    <p className="text-gray-500">No reviews yet for this lecturer.</p>
                )}
            </div>
            {sortedReviews.length > REVIEWS_TO_SHOW && (
                 <div className="p-2 border-t-2 border-black">
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full p-2 font-bold uppercase text-center bg-gray-200 border-2 border-black hover:bg-gray-300 active:bg-gray-400"
                    >
                        {isExpanded ? 'Show Less' : `Show ${sortedReviews.length - REVIEWS_TO_SHOW} More Reviews`}
                    </button>
                 </div>
            )}
        </div>
    );
}