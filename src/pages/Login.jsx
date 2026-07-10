import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { IoTerminalOutline, IoAlertCircleOutline, IoLogoGoogle } from 'react-icons/io5';

const Login = () => {
  const { login, signInWithGoogle, user, loading, error: authError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect once Firebase resolves the user + Firestore profile
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'company') {
        navigate('/dashboard/company', { replace: true });
      } else if (user.role === 'candidate') {
        navigate('/dashboard/candidate', { replace: true });
      } else if (user.role === null) {
        navigate('/choose-role', { replace: true });
      }
      // role === undefined → profile still resolving, wait
    }
  }, [user, loading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const res = await login(formData.email, formData.password);
    setSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Authentication failed');
    }
    // On success, useEffect above handles navigation
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    const res = await signInWithGoogle();
    setGoogleLoading(false);

    if (!res.success && res.error) {
      setError(res.error);
    }
    // On success, useEffect above handles navigation (including /choose-role)
  };

  const handleQuickLogin = (email, password) => {
    setFormData({ email, password });
  };

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 bg-slate-50/50">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="text-center flex flex-col items-center gap-2">
          <Link to="/" className="flex items-center gap-2 text-2xl font-black text-slate-900">
            <div className="p-1.5 bg-primary rounded-lg text-white">
              <IoTerminalOutline size={22} />
            </div>
            <span>Micro<span className="text-primary font-bold">Intern</span></span>
          </Link>
          <h2 className="text-xl font-bold text-slate-800 mt-2">Log in to your account</h2>
          <p className="text-xs text-slate-400">Welcome back! Please enter your details below.</p>
        </div>

        <Card className="border border-slate-100 shadow-sm">
          <CardBody className="flex flex-col gap-5">
            {error && (
              <div className="bg-red-50 text-red-700 text-xs font-semibold p-3.5 rounded-lg border border-red-100 flex items-center gap-2">
                <IoAlertCircleOutline size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* ── Google Sign-In ── */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || submitting}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
              )}
              {googleLoading ? 'Signing in...' : 'Continue with Google'}
            </button>

            {/* ── Divider ── */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">or sign in with email</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* ── Email / Password form ── */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              <Button type="submit" className="w-full mt-2" disabled={submitting || googleLoading}>
                {submitting ? 'Authenticating...' : 'Sign In'}
              </Button>
            </form>

            <div className="text-center text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline font-bold">
                Sign up
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Demo Fast Login — credentials will be seeded into Firebase Auth */}
        <Card className="bg-blue-50/50 border border-blue-100/50">
          <CardBody className="flex flex-col gap-3 py-4">
            <h4 className="text-xs font-bold text-blue-800">💡 Fast-login credentials for testing:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleQuickLogin('candidate@microintern.com', 'password')}
                className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-left p-2.5 rounded-lg font-medium text-slate-700 leading-tight transition-colors cursor-pointer"
              >
                <span className="block font-bold text-slate-800 text-[10px] uppercase text-primary">Candidate Account</span>
                alexrivera (candidate)
              </button>
              <button
                onClick={() => handleQuickLogin('company@stripe.com', 'password')}
                className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-left p-2.5 rounded-lg font-medium text-slate-700 leading-tight transition-colors cursor-pointer"
              >
                <span className="block font-bold text-slate-800 text-[10px] uppercase text-primary">Company Account</span>
                sarahchen (stripe)
              </button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Login;
