import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { UploadModal } from './UploadModal';
import { PostReviewModal } from './PostReviewModal';
import { useAppContext } from '../contexts/AppContext';
import { NewDocumentData, NewReviewData } from '../types';

export const Layout: React.FC = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isPostReviewModalOpen, setIsPostReviewModalOpen] = useState<boolean>(false);
  const { universities, addDocument } = useAppContext();

  const handleOpenUploadModal = () => setIsUploadModalOpen(true);
  const handleCloseUploadModal = () => setIsUploadModalOpen(false);
  
  const handleOpenPostReviewModal = () => setIsPostReviewModalOpen(true);
  const handleClosePostReviewModal = () => setIsPostReviewModalOpen(false);

  const handleUploadDocument = async (data: FormData) => {
    try {
      await addDocument(data);
      // Optionally, you can add a success notification here
    } catch (error) {
      console.error("Upload failed", error);
      // Optionally, you can add an error notification here
    } finally {
      handleCloseUploadModal();
    }
  };
  
  const handlePostReview = (newReviewData: NewReviewData) => {
    // This functionality will be implemented later
    console.log("Posting review:", newReviewData);
    handleClosePostReviewModal();
  };

  return (
    <div className="min-h-screen">
      <Header onUploadClick={handleOpenUploadModal} />
      <div className="md:grid md:grid-cols-12">
        <aside className="md:col-span-3 lg:col-span-2 border-t-2 border-b-2 md:border-b-0 md:border-r-2 border-black p-4">
          <Sidebar />
        </aside>
        <main className="md:col-span-9 lg:col-span-10 p-4 sm:p-6">
          <Outlet context={{ handleOpenPostReviewModal }}/>
        </main>
      </div>
      {isUploadModalOpen && (
        <UploadModal 
          onClose={handleCloseUploadModal}
          onUpload={handleUploadDocument}
          universities={universities}
        />
      )}
      {isPostReviewModalOpen && (
        <PostReviewModal
          onClose={handleClosePostReviewModal}
          onPostReview={handlePostReview}
          lecturers={[]} // Pass an empty array as lecturers are not loaded globally
        />
      )}
    </div>
  );
};