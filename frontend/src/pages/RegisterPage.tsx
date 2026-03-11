import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Manrope, sans-serif' }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-[46%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: '#0d0e14' }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)' }} />
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #5d5fef 0%, transparent 70%)' }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid2)" />
          </svg>
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#5d5fef' }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Workflow</span>
        </div>

        <div className="relative">
          <h1 className="text-4xl font-bold leading-tight mb-4 text-white">
            Your workspace,<br />
            <span style={{ color: '#ec4899' }}>your rules.</span>
          </h1>
          <p className="text-base leading-relaxed mb-8" style={{ color: '#6b6b80' }}>
            Join thousands of teams using Workflow to manage projects, track progress, and deliver results.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Teams', value: '10k+' },
              { label: 'Tasks managed', value: '2M+' },
              { label: 'Uptime', value: '99.9%' },
              { label: 'Boards', value: '50k+' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: '#6b6b80' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full"
              style={{ background: i === 1 ? '#ec4899' : 'rgba(255,255,255,0.15)' }} />
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[360px]">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
          <p className="text-sm text-gray-500 mb-8">Start managing your projects today</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name', type: 'text', value: name, onChange: setName, placeholder: 'John Doe' },
              { label: 'Email', type: 'email', value: email, onChange: setEmail, placeholder: 'you@company.com' },
              { label: 'Password', type: 'password', value: password, onChange: setPassword, placeholder: 'Min. 6 characters' },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white focus:border-[#5d5fef] focus:ring-2 focus:ring-[#5d5fef]/20 outline-none transition-all"
                />
              </div>
            ))}

            {error && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100">
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: loading ? '#8b8cf4' : '#5d5fef' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating account...
                </span>
              ) : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#5d5fef' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
