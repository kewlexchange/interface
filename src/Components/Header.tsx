import React from 'react';
import { NavLink } from 'react-router-dom';
import LOGO from '../assets/images/logo-paypal-style.svg';

const MENU = [
  { label: 'Swap', to: '/swap' },
  { label: 'NFTs', to: '/nfts' },
  { label: 'Metamorph', to: '/metamorph' },
  { label: 'Reflection', to: '/reflection' },
];

export function Header() {
  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <NavLink to="/" className="flex items-center space-x-2">
          <img src={LOGO} alt="KEWL" className="h-8" />
          <span className="text-xl font-semibold text-primary">KEWL</span>
        </NavLink>
        <nav className="hidden md:flex space-x-8">
          {MENU.map(i => (
            <NavLink
              key={i.to}
              to={i.to}
              className={({ isActive }) =>
                `hover:text-secondary transition ${
                  isActive
                    ? 'text-secondary font-bold border-b-2 border-secondary pb-1'
                    : 'text-neutral-700 font-medium'
                }`
              }
            >
              {i.label}
            </NavLink>
          ))}
        </nav>
        <button className="bg-primary text-white px-5 py-2 rounded-md hover:bg-secondary transition">
          Connect Wallet
        </button>
      </div>
    </header>
  );
} 