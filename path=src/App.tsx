import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';

/** 
 * Nav öğeleri tek bir listede tanımlı. 
 * Bunları Header'da hem masaüstü hem mobil için kullanıyoruz. 
 */
const NAV_ITEMS = [
  { label: 'Ana Sayfa', to: '/' },
  { label: 'Swap', to: '/swap' },
  { label: 'NFTs', to: '/nfts' },
  { label: 'Metamorph', to: '/metamorph' },
  { label: 'Reflection', to: '/reflection' },
];

/** Sabit Header bileşeni */
function Header() {
  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo / Marka */}
        <span className="text-primary text-2xl font-bold">KEWL</span>

        {/* Masaüstü navigasyon */}
        <nav className="hidden md:flex space-x-8">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `transition ${
                  isActive
                    ? 'text-secondary border-b-2 border-secondary font-semibold pb-1'
                    : 'text-neutral-700 hover:text-secondary'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Cüzdan Bağla butonu */}
        <button className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md transition">
          Connect Wallet
        </button>
      </div>
    </header>
  );
}

/** Sabit Footer bileşeni */
function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto flex justify-between px-6 py-4 text-sm text-neutral-600">
        <span>© 2024 KEWL.Exchange</span>
        <span>Block #123456</span>
      </div>
    </footer>
  );
}

/** Her rota için basit içerik bileşeni */
function Page({ title }: { title: string }) {
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-md shadow p-6">
      <h1 className="text-3xl font-semibold text-primary mb-4">{title}</h1>
      <p className="text-neutral-600">
        "{title}" sayfasının içeriği yakında eklenecektir.
      </p>
    </div>
  );
}

/** Uygulamanın ana bileşeni */
export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-neutral-50 font-sans">
        <Header />

        <main className="flex-1 px-6 py-8">
          <Routes>
            {NAV_ITEMS.map((item) => (
              <Route
                key={item.to}
                path={item.to}
                element={<Page title={item.label} />}
              />
            ))}
            {/* Tanımlı olmayan yollarda ana sayfaya dön */}
            <Route path="*" element={<Page title="Ana Sayfa" />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
} 