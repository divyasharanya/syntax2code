import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { IoTerminalOutline, IoAlertCircleOutline, IoPersonOutline, IoBriefcaseOutline } from 'react-icons/io5';

const Register = () => {
  const { register, error: authError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [role, setRole] = useState('candidate');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    title: '',
    companyName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'company' || roleParam === 'candidate') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const res = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role,
      title: formData.title,
      companyName: formData.companyName,
    });
    setLoading(false);

    if (res.success) {
      if (role === 'company') {
        navigate('/dashboard/company');
      } else {
        navigate('/dashboard/candidate');
      }
    } else {
      setError(res.error || 'Registration failed');
    }
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
          <h2 className="text-xl font-bold text-slate-800 mt-2">Create your account</h2>
          <p className="text-xs text-slate-400">Join MicroIntern to start posting or completing challenges.</p>
        </div>

        <Card className="border border-slate-100 shadow-sm">
          <CardBody className="flex flex-col gap-5">
            {error && (
              <div className="bg-red-50 text-red-700 text-xs font-semibold p-3.5 rounded-lg border border-red-100 flex items-center gap-2">
                <IoAlertCircleOutline size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Role Switcher */}
            <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  role === 'candidate'
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <IoPersonOutline size={14} />
                <span>Candidate</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('company')}
                className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  role === 'company'
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <IoBriefcaseOutline size={14} />
                <span>Company</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Full Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Alex Rivera"
                required
              />
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="alex@example.com"
                required
              />
              {role === 'candidate' ? (
                <Input
                  label="Professional Title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Frontend Engineer"
                  required
                />
              ) : (
                <Input
                  label="Company Name"
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Stripe"
                  required
                />
              )}
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />

              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? 'Creating Account...' : 'Get Started'}
              </Button>
            </form>

            <div className="text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-bold">
                Log in
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Register;
