export interface University {
  id: string;
  name: string;
  abbreviation: string;
}

export type FileType = 'PDF' | 'DOCX' | 'PPTX' | 'ZIP';

export interface DocumentFile {
    id: number;
    name: string;
    url: string;
    fileType: FileType;
    size: number; // in KB
}

export interface DocumentSection {
    title: string;
    files: DocumentFile[];
}

export interface Document {
  id: number;
  title:string;
  universityId: string;
  courseCode?: string;
  courseName: string;
  lecturerName?: string;
  description?: string;
  sections: DocumentSection[];
}

export type DocumentCategory = 'LECTURE' | 'EXAM' | 'SYLLABUS' | 'OTHER';

// This type is specifically for the new Upload Modal form data
export interface NewDocumentData {
  title: string;
  courseCode?: string;
  courseName: string;
  universityId: string;
  lecturerName?: string;
  description?: string;
  sections: {
    title: string;
    files: File[];
  }[];
}


export interface Lecturer {
    id: number;
    name: string;
    universityId: string;
}

export interface Comment {
    id: number;
    reviewId: number;
    author: string;
    content: string;
}

export interface Review {
    id: number;
    lecturerId: number;
    courseName: string;
    rating: number; // 1-5
    content: string;
    date: string; // ISO 8601 date string for sorting
    comments?: Comment[];
}

export type NewReviewData = Omit<Review, 'id' | 'date' | 'comments'>;

export interface AdvancedSearchFilters {
    lecturer: string;
    course: string;
    content: string;
}