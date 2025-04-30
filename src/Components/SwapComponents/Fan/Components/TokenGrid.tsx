import React, { useState } from 'react';
import TokenCard from './TokenCard';
import { Token, TokenSelectState } from './Types';
import { Button } from '@nextui-org/react';
import { List, Grid, LayoutGrid } from 'lucide-react';

interface TokenGridProps {
  tokens: Token[];
  selectedTokens: TokenSelectState;
  onTokenSelect: (tokenId: string) => void;
}

const TokenGrid: React.FC<TokenGridProps> = ({ 
  tokens, 
  selectedTokens, 
  onTokenSelect 
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "list" | "row">("list");
  
  return (
    <div className="w-full">
      {/* Header & View Mode Switcher */}
      <div className="flex justify-between items-center mb-4">
        {/* Left Side - Title & Description */}
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-1">Available Tokens</h4>
          <p className="text-xs text-slate-400">Click on tokens to toggle selection</p>
        </div>
        
        {/* Right Side - Counter & View Mode */}
        <div className="flex items-center gap-3">
          {/* Token Counter */}
          <span className="text-xs px-2 py-1 rounded-full bg-slate-800/80 border border-slate-700/50 text-slate-300">
            {tokens.length} total
          </span>
          
          {/* View Mode Switcher */}
          <div className="bg-slate-800/40 rounded-full p-1 flex gap-1">
            <Button 
              size="sm" 
              isIconOnly 
              variant="flat" 
              className={`rounded-full ${viewMode === 'list' ? 'bg-violet-500/30 text-violet-300' : 'bg-transparent text-slate-400'}`} 
              onPress={() => setViewMode("list")}
            >
              <List size={16} />
            </Button>
            <Button 
              size="sm" 
              isIconOnly 
              variant="flat" 
              className={`rounded-full ${viewMode === 'grid' ? 'bg-violet-500/30 text-violet-300' : 'bg-transparent text-slate-400'}`} 
              onPress={() => setViewMode("grid")}
            >
              <Grid size={16} />
            </Button>
            <Button 
              size="sm" 
              isIconOnly 
              variant="flat" 
              className={`rounded-full ${viewMode === 'row' ? 'bg-violet-500/30 text-violet-300' : 'bg-transparent text-slate-400'}`} 
              onPress={() => setViewMode("row")}
            >
              <LayoutGrid size={16} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Token List Container - Gölgeleri kaldırıldı */}
      <div 
        className="overflow-auto custom-scrollbar max-h-[320px] rounded-xl"
      >
        {/* Row View (Horizontal List) - Gölgeleri kaldırıldı */}
        {viewMode === "row" && (
          <div className="flex overflow-x-auto pb-4 pt-2 px-2 custom-scrollbar-horizontal">
            {tokens.map((token) => (
              <div 
                key={token.address} 
                onClick={() => onTokenSelect(token.address)}
                className={`
                  flex-shrink-0 mr-2 p-3 rounded-xl cursor-pointer
                  min-w-[180px] max-w-[200px]
                  ${selectedTokens[token.address] 
                    ? 'bg-violet-500/10 border border-violet-500/40' 
                    : 'bg-slate-800/40 border border-slate-700/30 hover:bg-slate-800/60 hover:border-slate-600/50'}
                  transition-all duration-200
                `}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center border border-slate-700/50">
                    <img 
                      src={token.logoURI} 
                      alt={token.symbol} 
                      className="w-full h-full object-cover"
                 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-200 text-sm">{token.symbol}</div>
                    <div className="text-xs text-slate-400 truncate">{token.name}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  {token.balance && (
                    <div className="text-xs text-left">
                      <div className="text-slate-400">Balance:</div>
                      <div className="text-slate-300 font-medium">{parseFloat(token.balance).toFixed(4)}</div>
                    </div>
                  )}
                  
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center ml-auto
                    ${selectedTokens[token.address] 
                      ? 'bg-violet-500' 
                      : 'bg-slate-700/50 border border-slate-600/50'}
                    transition-all duration-200
                  `}>
                    {selectedTokens[token.address] && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* List View */}
        {viewMode === "list" && (
          <div className="divide-y divide-slate-700/20">
            {tokens.map((token) => (
              <div 
                key={token.address}
                onClick={() => onTokenSelect(token.address)}
                className={`
                  flex items-center justify-between p-3 cursor-pointer
                  ${selectedTokens[token.address] ? 'bg-violet-500/10 border-l-2 border-violet-500' : 'hover:bg-slate-800/30 border-l-2 border-transparent'}
                  transition-colors duration-200
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center">
                    <img 
                      src={token.logoURI} 
                      alt={token.symbol} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-slate-200">{token.symbol}</div>
                    <div className="text-xs text-slate-400 truncate max-w-[150px]">{token.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {token.balance && (
                    <div className="text-xs text-right">
                      <div className="text-slate-300">{parseFloat(token.balance).toFixed(4)}</div>
                      <div className="text-slate-500 text-[10px]">Balance</div>
                    </div>
                  )}
                  <div className={`
                    w-5 h-5 rounded-full flex items-center justify-center 
                    ${selectedTokens[token.address] ? 'bg-violet-500' : 'bg-slate-700/50 border border-slate-600/50'}
                  `}>
                    {selectedTokens[token.address] && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Grid View (Original) */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3">
            {tokens.map((token) => (
              <TokenCard
                key={token.address}
                token={token}
                isSelected={!!selectedTokens[token.address]}
                onClick={() => onTokenSelect(token.address)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenGrid;