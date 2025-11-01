import React from 'react';
import type { Review, Comment } from '../types';
import { StarRating } from './StarRating';
import { CommentList } from './CommentList';
import { CommentForm } from './CommentForm';

interface ReviewItemProps {
    review: Review;
    comments: Comment[];
    onAddComment: (reviewId: number, content: string) => void;
}

export const ReviewItem: React.FC<ReviewItemProps> = ({ review, comments, onAddComment }) => {
    
    const handleCommentSubmit = (content: string) => {
        onAddComment(review.id, content);
    }

    return (
        <div className="border-2 border-black p-3">
           <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="font-bold">{review.courseName}</p>
                    <p className="text-xs text-gray-600">
                        {new Date(review.date).toLocaleString()}
                    </p>
                </div>
               <StarRating rating={review.rating} />
           </div>
           <p className="text-sm mb-3">{review.content}</p>
           
           <div className="pl-4 border-l-2 border-dashed border-gray-400 space-y-2">
                <CommentList comments={comments} />
                <CommentForm onSubmit={handleCommentSubmit} />
           </div>
        </div>
    );
};
