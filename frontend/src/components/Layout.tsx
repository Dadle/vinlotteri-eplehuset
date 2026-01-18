import { Link, useLocation } from 'react-router-dom';
import { useDarkMode } from '../hooks/useDarkMode';
import EplehusetLogo from './EplehusetLogo';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const [isDark, toggleDarkMode] = useDarkMode();
  const location = useLocation();

  const navLinks = [
    { path: '/new-draw', label: 'Ny trekning' },
    { path: '/history', label: 'Historikk' },
    { path: '/statistics', label: 'Statistikk' },
  ];

  return (
    <div className="min-h-screen apple-gradient dark-mode-transition">
      {/* Header - Glassmorphism with blue accent */}
      <header className="sticky top-0 z-50" style={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 113, 227, 0.1)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo with blue glow effect */}
            <Link to="/" className="group relative">
              <div className="transition-transform group-hover:scale-[1.02]">
                <EplehusetLogo />
              </div>
              {/* Blue glow on hover */}
              <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/15 rounded-xl blur-xl transition-all duration-300 -z-10" />
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navLinks.map(({ path, label }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-apple-gray hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}

              {/* Admin link (icon only) */}
              <Link
                to="/admin"
                className={`ml-2 p-2 rounded-full transition-all duration-300 ${
                  location.pathname === '/admin'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-apple-gray hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
                title="Vinkjeller"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2C12 2 8 8 8 13c0 4 2.5 7 4 7s4-3 4-7c0-5-4-11-4-11z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 20v2M10 22h4" />
                </svg>
              </Link>

              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="ml-2 p-2 rounded-full text-apple-gray hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
                aria-label={isDark ? 'Bytt til lyst modus' : 'Bytt til mørkt modus'}
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {children}
      </main>

      {/* Footer with logo */}
      <footer className="border-t border-gray-200/50 dark:border-gray-800/50 mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col items-center gap-4">
            <EplehusetLogo className="opacity-50" />
            <p className="text-center text-sm text-apple-gray">
              Vinlotteri · Kun til internt bruk
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
