import React from 'react';
import type { Lecturer, Review, University, Comment } from '../types';
import { LecturerReviewCard } from './LecturerReviewCard';

interface FilteredData {
    lecturer: Lecturer;
    reviews: Review[];
}

interface ReviewSectionProps {
    data: FilteredData[];
    comments: Comment[];
    universities: University[];
    onAddComment: (reviewId: number, content: string) => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ data, comments, universities, onAddComment }) => {
    const universityMap = new Map(universities.map(uni => [uni.id, uni]));

    return (
        <div>
            {data.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[50vh] border-2 border-dashed border-gray-400">
                    <p className="text-gray-600 text-lg">No lecturers found. Try a different filter or search term.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {data.map(({ lecturer, reviews }) => {
                        const university = universityMap.get(lecturer.universityId);
                        return (
                            <LecturerReviewCard
                                key={lecturer.id}
                                lecturer={lecturer}
                                reviews={reviews}
                                university={university}
                                comments={comments}
                                onAddComment={onAddComment}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};