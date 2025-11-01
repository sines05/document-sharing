import React from 'react';
import type { Comment } from '../types';
import { CommentIcon } from './icons/CommentIcon';

interface CommentListProps {
    comments: Comment[];
}

export const CommentList: React.FC<CommentListProps> = ({ comments }) => {
    if (comments.length === 0) {
        return null; // Don't render anything if there are no comments
    }

    return (
        <div className="pt-2 space-y-2">
            {comments.map(comment => (
                <div key={comment.id} className="text-sm p-2 border-2 border-black bg-gray-100">
                    <p>
                        <strong className="font-bold">{comment.author}:</strong> {comment.content}
                    </p>
                </div>
            ))}
        </div>
    );
};