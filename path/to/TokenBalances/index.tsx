import React, { FC, useState, useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useAppSelector } from '@/state/hooks';
import { Card, Avatar } from '@nextui-org/react';
import { ChevronsUpDown, BarChart2, LayoutGrid, List as ListIcon } from 'lucide-react';

interface Token {
  address: string;
  symbol: string;
  name: string;
  logoURI?: string;
  balance: string | number;
}

const truncate = (s: string) => s ? `${s.slice(0,6)}…${s.slice(-4)}` : '';
const fmt = (b: string|number) => {
  const n = Number(b); 
  return isNaN(n) ? b : n.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:6});
};

export const TokenBalances: FC = () => {
  const { chainId } = useWeb3React();
  const tokens = useAppSelector(s => s.user.tokenList?.[chainId] ?? []);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'symbol'|'balance'>('balance');
  const [sortOrder, setSortOrder] = useState<'asc'|'desc'>('desc');
  const [view, setView] = useState<'grid'|'list'>('grid');

  // loading & empty
  if (!tokens) return <div className="w-full h-32 flex items-center justify-center text-white">Loading…</div>;
  if (tokens.length === 0) return <div className="w-full h-32 flex items-center justify-center text-gray-400">Henüz token yok</div>;

  // filter + sort
  const filtered = useMemo(() =>
    tokens.filter(t =>
      t.symbol.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase())
    ), [tokens,search]
  );
  const sorted = useMemo(() => {
    return [...filtered].sort((a,b) => {
      let aV = sortKey==='symbol' ? a.symbol.toLowerCase() : Number(a.balance);
      let bV = sortKey==='symbol' ? b.symbol.toLowerCase() : Number(b.balance);
      if (aV < bV) return sortOrder==='asc' ? -1 : 1;
      if (aV > bV) return sortOrder==='asc' ?  1 : -1;
      return 0;
    });
  }, [filtered,sortKey,sortOrder]);

  const toggleSort = (key:'symbol'|'balance') => {
    if (sortKey===key) setSortOrder(o=>o==='asc'?'desc':'asc');
    else { setSortKey(key); setSortOrder('desc'); }
  };

  // Controls
  const Controls = () => (
    <div className="flex flex-wrap items-center gap-4 mb-6 px-6">
      <input
        className="flex-1 min-w-[180px] px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 placeholder-gray-300 text-white focus:outline-none"
        placeholder="🔍 Token ara..."
        value={search} onChange={e=>setSearch(e.target.value)}
      />
      <button onClick={()=>toggleSort('symbol')} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
        <ChevronsUpDown className={sortKey==='symbol'?'text-pink-400':'text-gray-400'} size={20}/>
      </button>
      <button onClick={()=>toggleSort('balance')} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
        <BarChart2 className={sortKey==='balance'?'text-pink-400':'text-gray-400'} size={20}/>
      </button>
      <div className="ml-auto flex gap-2">
        <button onClick={()=>setView('grid')} className={`p-2 rounded-full ${view==='grid'?'bg-pink-500 text-white':'bg-white/10'}`}>
          <LayoutGrid size={18}/>
        </button>
        <button onClick={()=>setView('list')} className={`p-2 rounded-full ${view==='list'?'bg-pink-500 text-white':'bg-white/10'}`}>
          <ListIcon size={18}/>
        </button>
      </div>
    </div>
  );

  // GridView
  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-6">
      {sorted.map(token=>(
        <Card
          key={token.address}
          isHoverable
          variant="flat"
          className="bg-white/5 backdrop-blur-lg border border-pink-500/20 rounded-2xl p-6 transform hover:-translate-y-2 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,0,150,0.4)] transition-all"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 p-1">
              <div className="bg-black/80 rounded-full w-full h-full flex items-center justify-center overflow-hidden">
                {token.logoURI
                  ? <img src={token.logoURI} alt="" className="w-8 h-8 object-contain"/>
                  : <span className="font-bold text-white">{token.symbol.slice(0,2)}</span>}
              </div>
            </div>
            <div className="ml-3 truncate">
              <p className="text-lg font-semibold text-white">{token.symbol}</p>
              <p className="text-sm text-gray-300">{token.name}</p>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-2xl font-mono font-bold text-pink-400">{fmt(token.balance)}</p>
            <p className="text-xs text-gray-400">{truncate(token.address)}</p>
          </div>
        </Card>
      ))}
    </div>
  );

  // ListView
  const ListView = () => (
    <div className="flex flex-col divide-y divide-white/10 px-6">
      {sorted.map((token,idx)=>(
        <div key={token.address}
             className={`flex items-center justify-between p-4 ${
               idx%2 ? 'bg-white/5':'bg-white/3'
             } hover:bg-white/10 transition-all`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 p-1">
              <div className="bg-black/80 rounded-full w-full h-full flex items-center justify-center overflow-hidden">
                {token.logoURI
                  ? <img src={token.logoURI} alt="" className="w-8 h-8 object-contain"/>
                  : <span className="font-bold text-white">{token.symbol.slice(0,2)}</span>}
              </div>
            </div>
            <div className="truncate">
              <p className="text-lg font-semibold text-white">{token.symbol}</p>
              <p className="text-sm text-gray-300">{token.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <p className="text-xl font-mono font-bold text-pink-400">{fmt(token.balance)}</p>
            <p className="text-xs text-gray-400">{truncate(token.address)}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black py-8">
      <Controls/>
      {view==='grid' ? <GridView/> : <ListView/>}
    </div>
  );
}; 