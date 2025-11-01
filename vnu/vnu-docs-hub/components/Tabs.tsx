import React from 'react';
import { NavLink } from 'react-router-dom';

export const Tabs: React.FC = () => {
  const getButtonClass = (isActive: boolean, position: 'left' | 'right') => {
    const baseClasses = `w-1/2 p-4 text-center font-bold uppercase border-2 border-black transition-all duration-200 ease-in-out`;
    const borderPosition = position === 'left' ? 'border-r-0' : '';

    if (isActive) {
      return `${baseClasses} ${borderPosition} bg-black text-yellow-300 cursor-default`;
    }
    return `${baseClasses} ${borderPosition} bg-white hover:bg-yellow-300 active:translate-y-0.5`;
  };

  return (
    <div className="flex mb-6">
      <NavLink
        to="/documents"
        className={({ isActive }) => getButtonClass(isActive, 'left')}
        style={({ isActive }) => !isActive ? { boxShadow: '4px 4px 0px #000' } : {}}
      >
        Documents &amp; Exams
      </NavLink>
      <NavLink
        to="/reviews"
        className={({ isActive }) => getButtonClass(isActive, 'right')}
        style={({ isActive }) => !isActive ? { boxShadow: '4px 4px 0px #000' } : {}}
      >
        Lecturer Reviews
      </NavLink>
    </div>
  );
};