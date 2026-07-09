import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { IoTerminalOutline, IoAlertCircleOutline } from 'react-icons/io5';

const Login = () => {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(formData.email, formData.password);
    setLoading(false);

    if (res.success) {
      // Find role of signed in user (by fetching from local session)
      const sessionUser = JSON.parse(localStorage.getItem('microintern_session'));
      if (sessionUser?.role === 'company') {
        navigate('/dashboard/company');
      } else if (sessionUser?.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/candidate');
      }
    } else {
      setError(res.error || 'Authentication failed');
    }
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
              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In'}
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

        {/* Demo Fast Login */}
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
