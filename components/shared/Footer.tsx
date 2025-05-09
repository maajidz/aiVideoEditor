'use client';

import React from 'react';
import { useLayoutContext } from '@/app/context/LayoutContext'; // Corrected alias path

interface FooterProps {
  children: React.ReactNode;
}

const Footer: React.FC<FooterProps> = ({ children }) => {
  const { isSidebarCollapsed } = useLayoutContext();

  // Determine the left offset based on sidebar state
  const footerLeftOffset = isSidebarCollapsed ? 'left-20' : 'left-64'; // Match tailwind classes w-20 and w-64

  return (
    <footer
      // Use semantic colors defined in tailwind.config.ts
      className={`fixed bottom-0 ${footerLeftOffset} right-0 bg-background-secondary border-t border-border px-6 py-4 flex justify-between items-center z-40 transition-all duration-300 ease-in-out`}
    >
      {children}
    </footer>
  );
};

export default Footer;  