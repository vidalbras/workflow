import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { boardService } from '../../services/board.service';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const { data: boards = [] } = useQuery({
    queryKey: ['boards'],
    queryFn: boardService.getBoards,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const boardColors = ['#5d5fef','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#14b8a6'];

  return (
    <aside
      className="flex flex-col h-screen w-60 shrink-0 sticky top-0"
      style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}
    >
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#5d5fef] flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
        </div>
        <span className="font-bold text-white text-[15px] tracking-tight">Workflow</span>
      </div>

      {/* Nav */}
      <nav className="px-2 space-y-0.5">
        <Link to="/" className={`sidebar-item ${location.pathname === '/' ? 'active' : ''}`}>
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </Link>
      </nav>

      {/* Boards section */}
      <div className="mt-5 px-2 flex-1 overflow-y-auto">
        <div className="px-3 mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--sidebar-text)' }}>
            Boards
          </span>
        </div>
        <div className="space-y-0.5">
          {boards.slice(0, 12).map((board: any, i: number) => {
            const isActive = location.pathname === `/board/${board.id}`;
            return (
              <Link
                key={board.id}
                to={`/board/${board.id}`}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: board.color || boardColors[i % boardColors.length] }}
                />
                <span className="truncate">{board.title}</span>
              </Link>
            );
          })}
          {boards.length === 0 && (
            <p className="px-3 text-xs" style={{ color: 'var(--sidebar-text)' }}>No boards yet</p>
          )}
        </div>
      </div>

      {/* User */}
      <div className="p-3 mt-auto" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg" style={{ color: 'var(--sidebar-text)' }}>
          <div className="w-7 h-7 rounded-full bg-[#5d5fef] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[11px] truncate" style={{ color: 'var(--sidebar-text)' }}>{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1 rounded hover:bg-white/10 transition-colors shrink-0"
            title="Sign out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--sidebar-text)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
