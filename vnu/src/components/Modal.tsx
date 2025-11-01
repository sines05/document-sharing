import React, { ReactNode } from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-white border-2 border-black w-full max-w-2xl relative flex flex-col max-h-[90vh]"
        style={{ boxShadow: '8px 8px 0px rgba(0,0,0,0.8)' }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b-2 border-black bg-yellow-300">
          <h2 id="modal-title" className="text-xl font-bold uppercase truncate pr-4">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-black hover:text-yellow-300 flex-shrink-0" aria-label={`Close ${title} modal`}>
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};