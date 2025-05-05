import React from 'react';
import { useAppSelector } from '../state/hooks';

export function Footer() {
  const blockNumber = useAppSelector(s => s.connection.blockNumber);
  return (
    <footer className="bg-white border-t text-neutral-600 py-4">
      <div className="container mx-auto flex justify-between px-6 text-sm">
        <span>© 2024 KEWL.Exchange</span>
        <span>Block # {blockNumber}</span>
      </div>
    </footer>
  );
} 