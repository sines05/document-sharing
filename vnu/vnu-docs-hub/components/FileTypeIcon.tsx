import React from 'react';
import { FileType } from '../types';
import { FilePdfIcon } from './icons/FilePdfIcon';
import { FileDocxIcon } from './icons/FileDocxIcon';
import { FilePptxIcon } from './icons/FilePptxIcon';
import { FileZipIcon } from './icons/FileZipIcon';


interface FileTypeIconProps {
    fileType: FileType;
    className?: string;
}

export const FileTypeIcon: React.FC<FileTypeIconProps> = ({ fileType, className = "h-24 w-24" }) => {
    switch (fileType) {
        case 'PDF':
            return <FilePdfIcon className={`${className} text-red-600`} />;
        case 'DOCX':
            return <FileDocxIcon className={`${className} text-blue-600`} />;
        case 'PPTX':
            return <FilePptxIcon className={`${className} text-orange-600`} />;
        case 'ZIP':
            return <FileZipIcon className={`${className} text-gray-600`} />;
        default:
            return null;
    }
};