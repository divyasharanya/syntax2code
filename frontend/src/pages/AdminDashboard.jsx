import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { IoPeopleOutline, IoBriefcaseOutline, IoListOutline, IoBanOutline, IoAlertCircleOutline } from 'react-icons/io5';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ candidates: [], companies: [], tasks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('candidates');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('/api/admin/overview/');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch admin overview data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const handleToggleDeactivateUser = async (userId) => {
    try {
      setError('');
      const res = await axios.post(`/api/admin/users/${userId}/deactivate/`);
      if (res.data.success) {
        setData((prev) => {
          const updateRole = (list) =>
            list.map((u) => (u.id === userId ? { ...u, deactivated: res.data.deactivated } : u));
          return {
            ...prev,
            candidates: updateRole(prev.candidates),
            companies: updateRole(prev.companies),
          };
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to toggle user deactivation');
    }
  };

  const handleToggleDeactivateTask = async (taskId) => {
    try {
      setError('');
      const res = await axios.post(`/api/admin/tasks/${taskId}/deactivate/`);
      if (res.data.success) {
        setData((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, deactivated: res.data.deactivated } : t)),
        }));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to toggle task deactivation');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="text-red-500 bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-2">
          <IoAlertCircleOutline size={20} />
          <span className="font-bold">Access Denied: Only platform administrators can view this page.</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col gap-6 max-w-7xl w-full mx-auto px-4 py-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Admin Administration</h1>
        <p className="text-sm text-slate-400">Moderate platform tasks, view user registration details, and deactivate accounts.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-xs font-semibold p-4 rounded-xl border border-red-100 flex items-center gap-2">
          <IoAlertCircleOutline size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-slate-100 shadow-xs">
          <CardBody className="flex items-center gap-4">
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
              <IoPeopleOutline size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Candidates</p>
              <h3 className="text-2xl font-black text-slate-800">{data.candidates.length}</h3>
            </div>
          </CardBody>
        </Card>
        <Card className="border border-slate-100 shadow-xs">
          <CardBody className="flex items-center gap-4">
            <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <IoBriefcaseOutline size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Companies</p>
              <h3 className="text-2xl font-black text-slate-800">{data.companies.length}</h3>
            </div>
          </CardBody>
        </Card>
        <Card className="border border-slate-100 shadow-xs">
          <CardBody className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <IoListOutline size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Challenges</p>
              <h3 className="text-2xl font-black text-slate-800">{data.tasks.length}</h3>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('candidates')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'candidates'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Candidates
        </button>
        <button
          onClick={() => setActiveTab('companies')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'companies'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Companies
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'tasks'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Challenges
        </button>
      </div>

      {/* Tables Section */}
      <Card className="border border-slate-100 shadow-xs overflow-hidden">
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            {activeTab === 'candidates' && (
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs text-slate-400 font-bold uppercase">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4 text-center">Points</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white">
                  {data.candidates.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-800">{c.name}</td>
                      <td className="px-6 py-4">{c.email}</td>
                      <td className="px-6 py-4">{c.title || 'Developer'}</td>
                      <td className="px-6 py-4 text-center font-bold text-amber-600">{c.points || 0}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={c.deactivated ? 'danger' : 'success'}>
                          {c.deactivated ? 'Deactivated' : 'Active'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant={c.deactivated ? 'success' : 'danger'}
                          onClick={() => handleToggleDeactivateUser(c.id)}
                          className="inline-flex items-center gap-1.5"
                        >
                          <IoBanOutline size={14} />
                          <span>{c.deactivated ? 'Activate' : 'Deactivate'}</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {data.candidates.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-slate-400">No candidates registered.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'companies' && (
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs text-slate-400 font-bold uppercase">
                  <tr>
                    <th className="px-6 py-4">Company Name</th>
                    <th className="px-6 py-4">Representative</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white">
                  {data.companies.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-800">{c.companyName}</td>
                      <td className="px-6 py-4 font-medium">{c.name}</td>
                      <td className="px-6 py-4">{c.email}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={c.deactivated ? 'danger' : 'success'}>
                          {c.deactivated ? 'Deactivated' : 'Active'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant={c.deactivated ? 'success' : 'danger'}
                          onClick={() => handleToggleDeactivateUser(c.id)}
                          className="inline-flex items-center gap-1.5"
                        >
                          <IoBanOutline size={14} />
                          <span>{c.deactivated ? 'Activate' : 'Deactivate'}</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {data.companies.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-slate-400">No companies registered.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'tasks' && (
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs text-slate-400 font-bold uppercase">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4 text-center">Difficulty</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Applicants</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white">
                  {data.tasks.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-800">{t.title}</td>
                      <td className="px-6 py-4">{t.companyName}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="outline">{t.difficulty}</Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={t.deactivated ? 'danger' : 'success'}>
                          {t.deactivated ? 'Deactivated' : 'Active'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-indigo-600">{t.applicantsCount}</td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant={t.deactivated ? 'success' : 'danger'}
                          onClick={() => handleToggleDeactivateTask(t.id)}
                          className="inline-flex items-center gap-1.5"
                        >
                          <IoBanOutline size={14} />
                          <span>{t.deactivated ? 'Restore' : 'Deactivate'}</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {data.tasks.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-slate-400">No challenges created.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminDashboard;
