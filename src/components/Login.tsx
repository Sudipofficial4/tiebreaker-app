import { useState } from 'react';
import { signIn, signUp } from '../lib/supabase';
import '../styles/Login.css';

interface LoginProps {
  onSuccess: () => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!username.trim()) {
          setError('Username is required');
          setLoading(false);
          return;
        }
        await signUp(email, password);
        setError('Account created! You can now sign in.');
        setEmail('');
        setPassword('');
        setUsername('');
        setTimeout(() => setIsSignUp(false), 2000);
      } else {
        await signIn(email, password);
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🏆 Tie-Sheet Generator</h1>
        <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>

        {error && <div className={`alert ${isSignUp && !error.includes('failed') ? 'alert-info' : 'alert-error'}`}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Choose a username"
                minLength={3}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">{isSignUp ? 'Email' : 'Email or Username'}</label>
            <input
              id="email"
              type={isSignUp ? 'email' : 'text'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={isSignUp ? 'your@email.com' : 'your@email.com or username'}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="form-footer">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setUsername('');
              }}
              className="btn-link"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

          {!isSignUp && (
            <div className="demo-credentials">
              <p className="demo-title">📝 Demo Credentials:</p>
              <p className="demo-text">Email: <strong>admin@tiebreaker.com</strong></p>
              <p className="demo-text">Password: <strong>Sudip@1234#k</strong></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
