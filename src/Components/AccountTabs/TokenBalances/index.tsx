import React, { FC, useState, useMemo, useCallback } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useAppSelector } from '@/state/hooks';
import { Card, Avatar } from '@nextui-org/react';
import {
  ChevronsUpDown,
  BarChart2,
  LayoutGrid,
  List as ListIcon,
} from 'lucide-react';

interface Token {
  address: string;
  symbol: string;
  name: string;
  logoURI?: string;
  balance: string | number;
}

// Ağ isimlendirmesi (isteğe göre genişletin)
const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum Mainnet',
  56: 'BSC',
  137: 'Polygon',
};

const truncateAddress = (a: string) =>
  a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '';
const formatBalance = (b: string | number) => {
  const n = Number(b);
  return isNaN(n)
    ? b.toString()
    : n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      });
};

export const TokenBalances: FC = () => {
  const { chainId } = useWeb3React();
  const tokens = useAppSelector((s) => s.user.tokenList?.[chainId] ?? []);

  // Loading skeleton
  if (tokens === undefined) {
    return (
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg" />
        ))}
      </div>
    );
  }

  // Empty state
  if (!tokens.length) {
    return (
      <div className="py-12 text-center text-gray-600">
        Henüz token bulunamadı.
      </div>
    );
  }

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'symbol' | 'balance'>('balance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter & sort
  const filtered = useMemo(
    () =>
      tokens.filter(
        (t) =>
          t.symbol.toLowerCase().includes(search.toLowerCase()) ||
          t.name.toLowerCase().includes(search.toLowerCase())
      ),
    [tokens, search]
  );
  const totalBalance = useMemo(
    () =>
      filtered.reduce(
        (acc, t) => acc + (isNaN(Number(t.balance)) ? 0 : Number(t.balance)),
        0
      ),
    [filtered]
  );
  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const diff =
        sortKey === 'symbol'
          ? a.symbol.localeCompare(b.symbol)
          : Number(a.balance) - Number(b.balance);
      return sortOrder === 'asc' ? diff : -diff;
    });
    return copy;
  }, [filtered, sortKey, sortOrder]);

  const toggleSort = useCallback(
    (key: 'symbol' | 'balance') => {
      if (sortKey === key) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
      else {
        setSortKey(key);
        setSortOrder('desc');
      }
    },
    [sortKey]
  );
  const handleClickToken = useCallback((address: string) => {
    console.log('Token seçildi:', address);
  }, []);

  // Sticky controls
  const Controls = (
    <div className="sticky rounded-lg top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex flex-wrap items-center gap-3">
      <input
        type="text"
        placeholder="🔍 Search Token..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 min-w-[160px] px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="Search Token"
      />
      <button
        onClick={() => toggleSort('symbol')}
        className="p-1 rounded border hover:bg-gray-100"
        aria-label="Sembole göre sırala"
      >
        <ChevronsUpDown
          size={18}
          className={sortKey === 'symbol' ? 'text-blue-600' : 'text-gray-500'}
          style={{
            transform:
              sortKey === 'symbol' && sortOrder === 'asc'
                ? 'rotate(180deg)'
                : undefined,
          }}
        />
      </button>
      <button
        onClick={() => toggleSort('balance')}
        className="p-1 rounded border hover:bg-gray-100"
        aria-label="Bakiyeye göre sırala"
      >
        <BarChart2
          size={18}
          className={sortKey === 'balance' ? 'text-blue-600' : 'text-gray-500'}
          style={{
            transform:
              sortKey === 'balance' && sortOrder === 'asc'
                ? 'rotate(180deg)'
                : undefined,
          }}
        />
      </button>
      <div className="ml-auto flex items-center gap-3">
        <button
          onClick={() => setViewMode('grid')}
          className={`p-1 rounded border ${
            viewMode === 'grid'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          aria-label="Grid görünümü"
        >
          <LayoutGrid size={16} />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`p-1 rounded border ${
            viewMode === 'list'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          aria-label="Liste görünümü"
        >
          <ListIcon size={16} />
        </button>
      </div>
    </div>
  );

  const GridView = (
    <div className="px-4 py-4" role="list">
      <div className="grid grid-cols-3 gap-4">
        {sorted.map((t) => (
          <Card
            key={t.address}
            isPressable
            variant="flat"
            onClick={() => handleClickToken(t.address)}
            onKeyDown={(e) =>
              e.key === 'Enter' && handleClickToken(t.address)
            }
            role="button"
            tabIndex={0}
            className="group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 hover:shadow-lg transition-transform transform hover:-translate-y-0.5 p-3 bg-white rounded-lg border border-gray-200"
            aria-label={`${t.symbol}, isim ${t.name}, bakiye ${formatBalance(
              t.balance
            )}`}
          >
            <Avatar
              src={t.logoURI}
              alt={t.symbol}
              squared
              css={{ size: '$sm', borderRadius: '$full' }}
              className="border"
              color={!t.logoURI ? 'primary' : undefined}
            >
              {!t.logoURI && t.symbol.charAt(0)}
            </Avatar>
            <p className="mt-2 text-xl font-bold text-gray-900 text-center">
              {t.symbol}
            </p>
            <p className="mt-1 text-xs text-gray-500 truncate text-center">
              {t.name}
            </p>
            <p className="mt-2 text-sm font-mono text-blue-600">
              {formatBalance(t.balance)}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );

  const ListView = (
    <ul className="divide-y divide-gray-200 px-4 py-4" role="list">
      {sorted.map((t) => (
        <li
          key={t.address}
          onClick={() => handleClickToken(t.address)}
          onKeyDown={(e) =>
            e.key === 'Enter' && handleClickToken(t.address)
          }
          tabIndex={0}
          role="listitem"
          className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label={`${t.symbol}, isim ${t.name}, adres ${t.address}, bakiye ${formatBalance(
            t.balance
          )}`}
        >
          <div className="flex items-center gap-3">
            <Avatar
              src={t.logoURI}
              alt={t.symbol}
              squared
              css={{ size: '$sm', borderRadius: '$full' }}
              className="border"
              color={!t.logoURI ? 'primary' : undefined}
            >
              {!t.logoURI && t.symbol.charAt(0)}
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-lg font-bold text-gray-900 truncate">
                {t.symbol}
              </span>
              <span className="text-xs text-gray-500 truncate">
                {t.name}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-mono text-blue-600">
              {formatBalance(t.balance)}
            </span>
            
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="flex flex-col bg-gray-50 rounded-lg">
      {Controls}
      {viewMode === 'grid' ? GridView : ListView}
    </div>
  );
};
