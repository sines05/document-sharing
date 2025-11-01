import React, { useState } from 'react';
import type { University, NewDocumentData } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { Modal } from './Modal';
import { CloseIcon } from './icons/CloseIcon';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (data: NewDocumentData) => void;
  universities: University[];
}

interface FormSection {
    id: number;
    title: string;
    files: File[];
}

export const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload, universities }) => {
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [universityId, setUniversityId] = useState(universities[0]?.id || '');
  const [lecturerName, setLecturerName] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState<FormSection[]>([{ id: 1, title: '', files: [] }]);
  const [error, setError] = useState<string | null>(null);

  const addSection = () => {
    setSections(prev => [...prev, { id: Date.now(), title: '', files: [] }]);
  };

  const removeSection = (id: number) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const updateSectionTitle = (id: number, newTitle: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
  };

  const handleFileChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSections(prev => prev.map(s => s.id === id ? { ...s, files: [...s.files, ...newFiles] } : s));
    }
  };

  const removeFile = (sectionId: number, fileIndex: number) => {
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        return { ...s, files: s.files.filter((_, i) => i !== fileIndex) };
      }
      return s;
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!title || !courseName || !universityId) {
      setError('Please fill out Title, Course Name, and University.');
      return;
    }

    const validSections = sections.filter(s => s.title.trim() && s.files.length > 0);
    if (validSections.length === 0) {
      setError('Each section must have a title and at least one file.');
      return;
    }

    // Instead of passing the complex object directly, we'll use FormData
    // This is more robust for file uploads.
    const formDataForApi = new FormData();
    formDataForApi.append('title', title);
    formDataForApi.append('courseName', courseName);
    formDataForApi.append('universityId', universityId);
    if (courseCode) formDataForApi.append('courseCode', courseCode);
    if (lecturerName) formDataForApi.append('lecturerName', lecturerName);
    if (description) formDataForApi.append('description', description);

    // Append sections and files in a way the backend can parse
    validSections.forEach((section, index) => {
        formDataForApi.append(`sections[${index}][title]`, section.title);
        section.files.forEach(file => {
            formDataForApi.append(`sections[${index}][files]`, file);
        });
    });
    
    // The `onUpload` function in the context needs to be adapted to accept FormData
    // For now, we'll assume it's updated and just pass the FormData object.
    // This will require a change in AppContext.tsx and api.ts
    // @ts-ignore - We'll fix the type mismatch in the next steps
    onUpload(formDataForApi);
  };

  return (
    <Modal title="Upload Document" onClose={onClose}>
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0">
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {error && <div className="p-2 bg-red-500 text-white border-2 border-black font-bold">{error}</div>}
                
                <h3 className="font-bold uppercase text-lg border-b-2 border-black pb-1">Document Info</h3>
                
                <div>
                    <label htmlFor="title" className="block font-bold mb-1 uppercase text-sm">Title</label>
                    <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 bg-white border-2 border-black focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="courseName" className="block font-bold mb-1 uppercase text-sm">Course Name</label>
                        <input id="courseName" type="text" value={courseName} onChange={(e) => setCourseName(e.target.value)} className="w-full p-2 bg-white border-2 border-black focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Introduction to Calculus" required />
                    </div>
                     <div>
                        <label htmlFor="universityId" className="block font-bold mb-1 uppercase text-sm">University</label>
                        <select id="universityId" value={universityId} onChange={(e) => setUniversityId(e.target.value)} className="w-full p-2 bg-white border-2 border-black appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500" required >
                            {universities.map(uni => <option key={uni.id} value={uni.id}>{uni.abbreviation}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="courseCode" className="block font-bold mb-1 uppercase text-sm">Course Code (Optional)</label>
                        <input id="courseCode" type="text" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} className="w-full p-2 bg-white border-2 border-black focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., MAT101" />
                    </div>
                    <div>
                        <label htmlFor="lecturerName" className="block font-bold mb-1 uppercase text-sm">Lecturer (Optional)</label>
                        <input id="lecturerName" type="text" value={lecturerName} onChange={(e) => setLecturerName(e.target.value)} className="w-full p-2 bg-white border-2 border-black focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block font-bold mb-1 uppercase text-sm">Description (Optional)</label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 bg-white border-2 border-black focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none" />
                </div>

                <h3 className="font-bold uppercase text-lg border-b-2 border-black pb-1 pt-4">Files & Sections</h3>

                {sections.map((section, index) => (
                    <div key={section.id} className="p-4 border-2 border-dashed border-black bg-gray-50 space-y-3 relative">
                        {sections.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeSection(section.id)}
                                className="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full border-2 border-black"
                                aria-label="Remove Section"
                            >
                                <TrashIcon />
                            </button>
                        )}
                        <div>
                            <label htmlFor={`sectionTitle-${section.id}`} className="block font-bold mb-1 uppercase text-sm">Section {index + 1} Title</label>
                            <input
                                id={`sectionTitle-${section.id}`}
                                type="text"
                                placeholder="e.g., Lecture Notes, Exam Papers"
                                value={section.title}
                                onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                                className="w-full p-2 bg-white border-2 border-black focus:outline-none"
                                required
                            />
                        </div>

                        {section.files.length > 0 && (
                            <ul className="space-y-1 text-sm">
                                {section.files.map((file, fileIdx) => (
                                    <li key={fileIdx} className="flex items-center justify-between bg-white p-1 border border-gray-300">
                                        <span className="truncate pr-2">{file.name} ({(file.size/1024).toFixed(1)} KB)</span>
                                        <button type="button" onClick={() => removeFile(section.id, fileIdx)} className="text-red-600 hover:text-red-800 flex-shrink-0" aria-label={`Remove ${file.name}`}>
                                            <CloseIcon />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div>
                            <label htmlFor={`file-upload-${section.id}`} className="w-full cursor-pointer text-center block p-2 bg-blue-500 text-white border-2 border-black font-bold uppercase text-sm hover:bg-blue-600">
                                Add Files
                            </label>
                            <input id={`file-upload-${section.id}`} type="file" multiple onChange={(e) => handleFileChange(section.id, e)} className="hidden" />
                        </div>
                    </div>
                ))}
                
                <button
                    type="button"
                    onClick={addSection}
                    className="w-full flex items-center justify-center gap-2 p-2 bg-yellow-300 text-black border-2 border-black font-bold uppercase text-sm hover:bg-yellow-400"
                >
                    <PlusIcon />
                    Add Section
                </button>
            </div>

            <div className="flex-shrink-0 p-4 border-t-2 border-black bg-gray-100">
                <button
                    type="submit"
                    className="w-full p-3 bg-black text-white font-bold uppercase border-2 border-black hover:bg-gray-800 active:bg-gray-900 transition-colors"
                >
                    Submit Document
                </button>
            </div>
        </form>
    </Modal>
  );
};