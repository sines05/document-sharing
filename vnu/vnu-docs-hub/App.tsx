import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { Layout } from './components/Layout';
import { DocumentsPage } from './pages/DocumentsPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/documents" replace />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="documents/:documentId" element={<DocumentDetailPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Route>
      </Routes>
    </AppProvider>
  );
};

export default App;