import { useState } from 'react';
import { login } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { loginSuccess } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
      <div className="card login-card">
        <h1>RCS Campaign Admin</h1>
        <p className="subtitle" style={{ marginBottom: '1.5rem' }}>
          Sign in to manage campaigns
        </p>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin@rcs.com"
            required
            autoComplete="email"
          />
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}
