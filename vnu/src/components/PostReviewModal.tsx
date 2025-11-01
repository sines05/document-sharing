import React, { useState } from 'react';
import type { Lecturer, NewReviewData } from '../types';
import { StarRatingInput } from './StarRatingInput';
import { Modal } from './Modal';

interface PostReviewModalProps {
  onClose: () => void;
  onPostReview: (data: NewReviewData) => void;
  lecturers: Lecturer[];
}

export const PostReviewModal: React.FC<PostReviewModalProps> = ({ onClose, onPostReview, lecturers }) => {
  const [lecturerId, setLecturerId] = useState<string>(lecturers[0]?.id.toString() || '');
  const [courseName, setCourseName] = useState('');
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!lecturerId || !courseName || rating === 0 || !content) {
      setError('Please fill out all fields, including the rating.');
      return;
    }
    setError(null);

    const newReview: NewReviewData = {
      lecturerId: parseInt(lecturerId, 10),
      courseName,
      rating,
      content,
    };
    
    onPostReview(newReview);
  };

  return (
    <Modal title="Post a Review" onClose={onClose}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <div className="p-2 bg-red-500 text-white border-2 border-black font-bold">{error}</div>}
            
            <div>
                <label htmlFor="lecturerId" className="block font-bold mb-1 uppercase text-sm">Lecturer</label>
                <select
                    id="lecturerId"
                    value={lecturerId}
                    onChange={(e) => setLecturerId(e.target.value)}
                    className="w-full p-2 bg-white border-2 border-black appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                >
                    {lecturers.map(lecturer => (
                        <option key={lecturer.id} value={lecturer.id}>{lecturer.name}</option>
                    ))}
                </select>
            </div>
            
            <div>
                <label htmlFor="courseName" className="block font-bold mb-1 uppercase text-sm">Course Name</label>
                <input
                    id="courseName"
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full p-2 bg-white border-2 border-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Introduction to Calculus"
                    required
                />
            </div>

            <div>
                 <label className="block font-bold mb-1 uppercase text-sm">Rating</label>
                 <StarRatingInput rating={rating} setRating={setRating} />
            </div>

            <div>
                <label htmlFor="content" className="block font-bold mb-1 uppercase text-sm">Review</label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-2 bg-white border-2 border-black focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                    placeholder="Share your thoughts on the course and lecturer..."
                    required
                />
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    className="w-full p-3 bg-black text-white font-bold uppercase border-2 border-black hover:bg-gray-800 active:bg-gray-900 transition-colors"
                >
                    Submit Review
                </button>
            </div>
        </form>
    </Modal>
  );
};