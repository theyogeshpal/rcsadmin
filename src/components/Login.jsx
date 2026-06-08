import { useState } from 'react';
import { login } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Send, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const { loginSuccess } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(username, password);
      loginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <div 
        className="card login-card" 
        style={{ 
          padding: '2.5rem', 
          borderRadius: '16px', 
          background: 'rgba(13, 17, 23, 0.65)', 
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(45, 55, 80, 0.5)'
        }}
      >
        
        {/* Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div 
            className="logo-icon" 
            style={{ 
              width: 56, 
              height: 56, 
              borderRadius: 14, 
              margin: '0 auto 1rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(79, 140, 255, 0.4)'
            }}
          >
            <Send size={26} color="#fff" style={{ transform: 'translateX(-2px)' }} />
          </div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.25rem', color: '#e6edf3', letterSpacing: '-0.02em' }}>
            Welcome Back
          </h1>
          <p style={{ color: '#8b949e', fontSize: '0.9rem', margin: 0 }}>
            Sign in to RCS Admin Panel
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Email Address
            </label>
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin@rcs.com"
              required
              autoComplete="email"
              autoFocus
              style={{ 
                  padding: '0.8rem 1rem', 
                  fontSize: '0.95rem', 
                  paddingRight: '2.75rem',
                  backgroundColor: 'rgba(22, 27, 39, 0.7)',
                  marginBottom: 0
                }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Password
            </label>
            <div style={{ position: 'relative', marginTop: '0.4rem' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                style={{ 
                  padding: '0.8rem 1rem', 
                  fontSize: '0.95rem', 
                  paddingRight: '2.75rem',
                  backgroundColor: 'rgba(22, 27, 39, 0.7)',
                  marginBottom: 0
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  padding: '0.4rem',
                  color: '#8b949e',
                  cursor: 'pointer',
                  boxShadow: 'none',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="error" style={{ marginBottom: '1rem', justifyContent: 'center' }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Submit */}
          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              width: '100%', 
              padding: '0.9rem', 
              fontSize: '1rem', 
              letterSpacing: '0.02em',
              boxShadow: '0 4px 12px rgba(79, 140, 255, 0.25)'
            }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, marginRight: '0.5rem', borderTopColor: '#fff' }} />
                Authenticating…
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
      </div>
    </div>
  );
}
