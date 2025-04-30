import React from 'react';
import { Token } from './Types';

interface TokenCardProps {
  token: Token;
  isSelected: boolean;
  onClick: () => void;
}

const TokenCard: React.FC<TokenCardProps> = ({ token, isSelected, onClick }) => {
  return (
    <div 
      className={`
        group relative overflow-hidden rounded-full cursor-pointer transition-all duration-200
        flex items-center py-1.5 px-2 h-10 max-w-[180px]
        ${isSelected 
          ? 'bg-gradient-to-r from-violet-600 to-violet-800 shadow-md shadow-violet-500/20 border border-violet-400/30' 
          : 'bg-slate-800/90 border border-slate-700/30 hover:bg-slate-700/90 hover:border-slate-600/50'
        }
        backdrop-filter backdrop-blur-sm
      `}
      onClick={onClick}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
    >
      {/* Token Logo */}
      <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mr-2 border border-slate-700/50">
        <img 
          src={token.logoURI} 
          alt={token.symbol} 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/2d3748/white?text=' + token.symbol.charAt(0);
          }}
        />
      </div>
      
      {/* Token Info */}
      <div className="flex flex-col justify-center min-w-0 flex-1">
        <span className={`font-medium text-sm leading-tight truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
          {token.symbol}
        </span>
        <p className={`text-xs truncate leading-tight ${isSelected ? 'text-violet-200/90' : 'text-slate-400'}`}>
          {token.name}
        </p>
      </div>
      
      {/* Selection Indicator */}
      <div className={`
        ml-1.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center
        transition-all duration-200 border
        ${isSelected 
          ? 'bg-white border-white' 
          : 'bg-transparent border-slate-500 group-hover:border-slate-400'
        }
      `}>
        {isSelected && (
          <svg className="w-3 h-3 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
          </svg>
        )}
      </div>
      
      {/* Subtle Highlight Effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
    </div>
  );
};

export default TokenCard;