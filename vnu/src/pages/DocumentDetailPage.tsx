import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Document } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { FileTypeIcon } from '../components/FileTypeIcon';
import { FolderIcon } from '../components/icons/FolderIcon';
import { API_BASE_URL } from '../constants'; // Import API_BASE_URL

export const DocumentDetailPage: React.FC = () => {
    const [document, setDocument] = useState<Document | null>(null);
    const [loading, setLoading] = useState(true);
    const { documentId } = useParams<{ documentId: string }>();
    const navigate = useNavigate();
    const { universities, getDocumentById, selectedUniversityId } = useAppContext();

    const fetchDocument = useCallback(async () => {
        if (documentId) {
            setLoading(true);
            try {
                const doc = await getDocumentById(parseInt(documentId, 10));
                setDocument(doc || null);
            } catch (error) {
                console.error("Failed to fetch document detail:", error);
                setDocument(null);
            } finally {
                setLoading(false);
            }
        }
    }, [documentId, getDocumentById]);

    useEffect(() => {
        fetchDocument();
    }, [fetchDocument]);

    useEffect(() => {
        // If the user changes the university filter while viewing a document,
        // and the document doesn't belong to the new university, navigate back to the list.
        if (document && selectedUniversityId && document.universityId !== selectedUniversityId) {
            navigate('/documents');
        }
    }, [selectedUniversityId, document, navigate]);

    if (loading) {
        return <div className="text-center p-10">Loading document...</div>;
    }

    if (!document) {
        return <div className="text-center p-10">Document not found.</div>;
    }
    
    const university = universities.find(uni => uni.id === document.universityId);
    const courseInfo = [university?.abbreviation, document.courseCode].filter(Boolean).join(' - ');
    const totalFiles = document.sections.reduce((sum, section) => sum + section.files.length, 0);

    return (
        <div className="max-w-4xl mx-auto">
            <button 
                onClick={() => navigate('/documents')}
                className="mb-4 font-bold hover:underline"
            >
                &larr; Back to documents
            </button>
            <div
                className="bg-white border-2 border-black w-full"
                style={{ boxShadow: '8px 8px 0px rgba(0,0,0,0.8)' }}
            >
                <div className="flex-shrink-0 flex justify-between items-center p-4 border-b-2 border-black bg-yellow-300">
                    <h1 id="document-detail-title" className="text-xl font-bold uppercase truncate pr-4">{document.title}</h1>
                </div>

                <div className="p-6">
                    <div className="mb-6">
                        <p className="text-sm text-gray-700">
                            <span className="font-bold uppercase">{courseInfo}</span>
                            {courseInfo && ' - '}
                            <span>{document.courseName}</span>
                        </p>
                        {document.lecturerName && (
                             <p className="text-sm text-gray-700 mt-1">
                                <span className="font-bold uppercase">Lecturer:</span> {document.lecturerName}
                            </p>
                        )}
                        {document.description && (
                            <p className="mt-2 text-sm border-2 border-dashed border-gray-400 p-3 bg-gray-50">{document.description}</p>
                        )}
                    </div>
                    
                    <div className="space-y-4">
                        {document.sections.map((section, index) => (
                            <div key={index}>
                                <h3 className="flex items-center gap-2 font-bold text-lg border-b-2 border-black pb-1 mb-3">
                                    <FolderIcon className="h-6 w-6 text-gray-700" />
                                    <span>{section.title} ({section.files.length})</span>
                                </h3>
                                <ul className="space-y-2">
                                    {section.files.map(file => (
                                        <li key={file.id} className="flex items-center justify-between p-2 border-2 border-black bg-white hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <FileTypeIcon fileType={file.fileType} className="h-8 w-8 flex-shrink-0" />
                                                <div className="truncate">
                                                    <p className="font-bold truncate" title={file.name}>{file.name}</p>
                                                    <p className="text-xs text-gray-600">{file.size} KB</p>
                                                </div>
                                            </div>
                                            <a 
                                                href={`${API_BASE_URL}${file.url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-shrink-0 flex items-center gap-1.5 ml-2 p-2 bg-blue-500 text-white border-2 border-black font-bold uppercase text-xs hover:bg-blue-600 active:bg-blue-700"
                                            >
                                                <DownloadIcon />
                                                <span className="hidden sm:inline">Download</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="flex-shrink-0 p-4 border-t-2 border-black bg-gray-100">
                     <div className="text-sm font-bold text-center">
                        Total: {document.sections.length} sections, {totalFiles} files
                     </div>
                </div>
            </div>
        </div>
    );
};