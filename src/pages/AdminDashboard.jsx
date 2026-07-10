import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  collection, getDocs, doc, updateDoc, query, orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import {
  IoShieldCheckmarkOutline, IoPeopleOutline, IoBriefcaseOutline,
  IoListOutline, IoDocumentTextOutline, IoLogOutOutline,
  IoSearchOutline, IoChevronForwardOutline, IoRefreshOutline,
  IoOpenOutline, IoLogoGithub, IoCalendarOutline, IoPersonOutline,
  IoAlertCircleOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline,
  IoTimeOutline, IoBanOutline, IoArrowBackOutline, IoStarOutline,
} from 'react-icons/io5';

// ─── Utilities ────────────────────────────────────────────────────────────────

const fmtDate = (val) => {
  if (!val) return '—';
  try {
    const d = val?.toDate ? val.toDate() : new Date(val);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
};

const STATUS_STYLES = {
  Applied:     { bg: 'bg-blue-50',   text: 'text-blue-700',   label: 'Applied' },
  Reviewed:    { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Reviewed' },
  Shortlisted: { bg: 'bg-amber-50',  text: 'text-amber-700',  label: 'Shortlisted' },
  Interview:   { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Interview' },
  Offered:     { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Offered' },
  Rejected:    { bg: 'bg-red-50',    text: 'text-red-700',    label: 'Rejected' },
  open:        { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Open' },
  inactive:    { bg: 'bg-slate-100', text: 'text-slate-500',  label: 'Inactive' },
  closed:      { bg: 'bg-red-50',    text: 'text-red-600',    label: 'Closed' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || { bg: 'bg-slate-100', text: 'text-slate-500', label: status || '—' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
};

const Avatar = ({ name, size = 8 }) => {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['bg-blue-500','bg-indigo-500','bg-violet-500','bg-rose-500','bg-amber-500','bg-emerald-500'];
  const color = colors[(initials.charCodeAt(0) || 0) % colors.length];
  return (
    <div className={`w-${size} h-${size} rounded-full ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
};

const EmptyState = ({ icon, message }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
    <div className="text-4xl opacity-30">{icon}</div>
    <p className="text-sm font-medium">{message}</p>
  </div>
);

const Spinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// ─── Search bar ──────────────────────────────────────────────────────────────

const SearchBar = ({ value, onChange, placeholder }) => (
  <div className="relative">
    <IoSearchOutline size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-8 pr-4 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
    />
  </div>
);

// ─── Main AdminDashboard ─────────────────────────────────────────────────────

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('companies');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null); // { type, data }

  // Raw Firestore data
  const [rawUsers, setRawUsers]           = useState([]);
  const [rawTasks, setRawTasks]           = useState([]);
  const [rawApplications, setRawApps]    = useState([]);
  const [rawSubmissions, setRawSubs]      = useState([]);

  const fetchAll = useCallback(async () => {
    try {
      const [usersSnap, tasksSnap, appsSnap, subsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(query(collection(db, 'tasks'),        orderBy('createdAt',   'desc'))),
        getDocs(query(collection(db, 'applications'), orderBy('appliedAt',   'desc'))),
        getDocs(query(collection(db, 'submissions'),  orderBy('submittedAt', 'desc'))),
      ]);
      setRawUsers(usersSnap.docs.map(d => ({ id: d.id, uid: d.id, ...d.data() })));
      setRawTasks(tasksSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setRawApps(appsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setRawSubs(subsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Admin data fetch error:', err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchAll().finally(() => setLoading(false));
  }, [fetchAll]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  // ── Derived / enriched data ─────────────────────────────────────────────
  const companies = useMemo(() => rawUsers.filter(u => u.role === 'company'), [rawUsers]);
  const candidates = useMemo(() => rawUsers.filter(u => u.role === 'candidate'), [rawUsers]);

  const enrichedCompanies = useMemo(() =>
    companies.map(c => {
      const cTasks = rawTasks.filter(t => t.companyId === c.uid);
      const totalApps = cTasks.reduce((s, t) => s + (t.applicantsCount || 0), 0);
      return { ...c, taskCount: cTasks.length, totalApplicants: totalApps };
    }), [companies, rawTasks]);

  const enrichedCandidates = useMemo(() =>
    candidates.map(c => {
      const apps = rawApplications.filter(a => a.candidateId === c.uid);
      const subs = rawSubmissions.filter(s => s.candidateId === c.uid);
      return { ...c, appCount: apps.length, subCount: subs.length, latestStatus: apps[0]?.status || null };
    }), [candidates, rawApplications, rawSubmissions]);

  const enrichedTasks = useMemo(() =>
    rawTasks.map(t => {
      const company = companies.find(c => c.uid === t.companyId);
      return { ...t, companyDisplayName: company?.companyName || company?.name || t.companyName || '—' };
    }), [rawTasks, companies]);

  const enrichedSubmissions = useMemo(() =>
    rawSubmissions.map(s => {
      const task = rawTasks.find(t => t.id === s.taskId);
      const candidate = candidates.find(c => c.uid === s.candidateId);
      return {
        ...s,
        taskTitle: task?.title || s.taskTitle || '—',
        candidateDisplayName: candidate?.name || s.candidateName || '—',
      };
    }), [rawSubmissions, rawTasks, candidates]);

  // ── Deactivate helpers ─────────────────────────────────────────────────
  const deactivateUser = async (uid) => {
    await updateDoc(doc(db, 'users', uid), { active: false });
    setRawUsers(prev => prev.map(u => u.uid === uid ? { ...u, active: false } : u));
    if (selected?.data?.uid === uid) setSelected(prev => ({ ...prev, data: { ...prev.data, active: false } }));
  };

  const deactivateTask = async (id) => {
    await updateDoc(doc(db, 'tasks', id), { status: 'inactive' });
    setRawTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'inactive' } : t));
    if (selected?.data?.id === id) setSelected(prev => ({ ...prev, data: { ...prev.data, status: 'inactive' } }));
  };

  // ── Filtered lists ────────────────────────────────────────────────────
  const q = search.toLowerCase();
  const filteredCompanies  = enrichedCompanies.filter(c =>
    (c.companyName || c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q));
  const filteredCandidates = enrichedCandidates.filter(c =>
    (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q));
  const filteredTasks = enrichedTasks.filter(t =>
    (t.title || '').toLowerCase().includes(q) || (t.companyDisplayName || '').toLowerCase().includes(q));
  const filteredSubmissions = enrichedSubmissions.filter(s =>
    (s.candidateDisplayName || '').toLowerCase().includes(q) || (s.taskTitle || '').toLowerCase().includes(q));

  // ── Tab config ────────────────────────────────────────────────────────
  const tabs = [
    { id: 'companies',   label: 'Companies',   icon: <IoBriefcaseOutline size={15}/>, count: companies.length },
    { id: 'candidates',  label: 'Candidates',  icon: <IoPeopleOutline size={15}/>,    count: candidates.length },
    { id: 'tasks',       label: 'Tasks',       icon: <IoListOutline size={15}/>,      count: rawTasks.length },
    { id: 'submissions', label: 'Submissions', icon: <IoDocumentTextOutline size={15}/>, count: rawSubmissions.length },
  ];

  const handleTabChange = (id) => { setActiveTab(id); setSearch(''); setSelected(null); };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Top Bar ── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-1.5 text-sm font-black text-slate-900">
              <div className="p-1 bg-primary rounded text-white"><IoShieldCheckmarkOutline size={14}/></div>
              MicroIntern <span className="text-primary">Admin</span>
            </Link>
            <span className="hidden sm:block text-xs text-slate-400 font-medium border-l border-slate-200 pl-3">
              {user?.email}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <IoRefreshOutline size={14} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
            >
              <IoLogOutOutline size={14} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">

        {/* ── KPI Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Companies',   value: companies.length,       icon: <IoBriefcaseOutline size={20}/>, color: 'bg-blue-50 text-blue-600' },
            { label: 'Candidates',  value: candidates.length,      icon: <IoPeopleOutline size={20}/>,    color: 'bg-indigo-50 text-indigo-600' },
            { label: 'Tasks',       value: rawTasks.length,        icon: <IoListOutline size={20}/>,      color: 'bg-violet-50 text-violet-600' },
            { label: 'Submissions', value: rawSubmissions.length,  icon: <IoDocumentTextOutline size={20}/>, color: 'bg-rose-50 text-rose-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${stat.color}`}>{stat.icon}</div>
              <div>
                <p className="text-2xl font-black text-slate-900">{loading ? '—' : stat.value}</p>
                <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Panel ── */}
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">

          {/* Tab bar */}
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-primary/3'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Content: table + optional detail panel */}
          <div className={`flex ${selected ? 'divide-x divide-slate-100' : ''}`}>

            {/* ── LEFT: Table ── */}
            <div className={`flex-1 min-w-0 flex flex-col ${selected ? 'max-w-[55%]' : ''}`}>

              {/* Search */}
              <div className="p-4 border-b border-slate-50">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder={`Search ${activeTab}...`}
                />
              </div>

              {loading ? <Spinner /> : (
                <>
                  {/* ── Companies tab ── */}
                  {activeTab === 'companies' && (
                    <div className="overflow-x-auto">
                      {filteredCompanies.length === 0
                        ? <EmptyState icon="🏢" message="No companies yet" />
                        : (
                          <table className="w-full text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wide">
                              <tr>
                                <th className="px-4 py-3 text-left">Company</th>
                                <th className="px-4 py-3 text-left hidden md:table-cell">Email</th>
                                <th className="px-4 py-3 text-center">Tasks</th>
                                <th className="px-4 py-3 text-center">Applicants</th>
                                <th className="px-4 py-3 text-left hidden lg:table-cell">Joined</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3" />
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {filteredCompanies.map(c => (
                                <tr
                                  key={c.uid}
                                  onClick={() => setSelected({ type: 'company', data: c })}
                                  className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${selected?.data?.uid === c.uid ? 'bg-primary/3 border-l-2 border-primary' : ''}`}
                                >
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2.5">
                                      <Avatar name={c.companyName || c.name} />
                                      <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                                        {c.companyName || c.name || '—'}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 hidden md:table-cell text-slate-500 truncate max-w-[160px]">{c.email}</td>
                                  <td className="px-4 py-3 text-center font-bold text-slate-700">{c.taskCount}</td>
                                  <td className="px-4 py-3 text-center font-bold text-slate-700">{c.totalApplicants}</td>
                                  <td className="px-4 py-3 hidden lg:table-cell text-slate-400">{fmtDate(c.createdAt)}</td>
                                  <td className="px-4 py-3 text-center">
                                    {c.active === false
                                      ? <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Deactivated</span>
                                      : <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                                    }
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <IoChevronForwardOutline size={14} className="text-slate-300 ml-auto" />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                    </div>
                  )}

                  {/* ── Candidates tab ── */}
                  {activeTab === 'candidates' && (
                    <div className="overflow-x-auto">
                      {filteredCandidates.length === 0
                        ? <EmptyState icon="👤" message="No candidates yet" />
                        : (
                          <table className="w-full text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wide">
                              <tr>
                                <th className="px-4 py-3 text-left">Candidate</th>
                                <th className="px-4 py-3 text-left hidden md:table-cell">Email</th>
                                <th className="px-4 py-3 text-center">Apps</th>
                                <th className="px-4 py-3 text-center">Subs</th>
                                <th className="px-4 py-3 text-left hidden lg:table-cell">Joined</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3" />
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {filteredCandidates.map(c => (
                                <tr
                                  key={c.uid}
                                  onClick={() => setSelected({ type: 'candidate', data: c })}
                                  className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${selected?.data?.uid === c.uid ? 'bg-primary/3 border-l-2 border-primary' : ''}`}
                                >
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2.5">
                                      <Avatar name={c.name} />
                                      <div>
                                        <p className="font-semibold text-slate-800">{c.name || '—'}</p>
                                        <p className="text-slate-400">{c.title || ''}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 hidden md:table-cell text-slate-500 truncate max-w-[160px]">{c.email}</td>
                                  <td className="px-4 py-3 text-center font-bold text-slate-700">{c.appCount}</td>
                                  <td className="px-4 py-3 text-center font-bold text-slate-700">{c.subCount}</td>
                                  <td className="px-4 py-3 hidden lg:table-cell text-slate-400">{fmtDate(c.createdAt)}</td>
                                  <td className="px-4 py-3 text-center">
                                    {c.active === false
                                      ? <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Deactivated</span>
                                      : <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                                    }
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <IoChevronForwardOutline size={14} className="text-slate-300 ml-auto" />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                    </div>
                  )}

                  {/* ── Tasks tab ── */}
                  {activeTab === 'tasks' && (
                    <div className="overflow-x-auto">
                      {filteredTasks.length === 0
                        ? <EmptyState icon="📋" message="No tasks yet" />
                        : (
                          <table className="w-full text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wide">
                              <tr>
                                <th className="px-4 py-3 text-left">Task</th>
                                <th className="px-4 py-3 text-left hidden md:table-cell">Company</th>
                                <th className="px-4 py-3 text-center">Applicants</th>
                                <th className="px-4 py-3 text-left hidden lg:table-cell">Deadline</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3" />
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {filteredTasks.map(t => (
                                <tr
                                  key={t.id}
                                  onClick={() => setSelected({ type: 'task', data: t })}
                                  className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${selected?.data?.id === t.id ? 'bg-primary/3 border-l-2 border-primary' : ''}`}
                                >
                                  <td className="px-4 py-3">
                                    <p className="font-semibold text-slate-800 truncate max-w-[180px]">{t.title}</p>
                                    <p className="text-slate-400">{t.difficulty} · ${t.reward}</p>
                                  </td>
                                  <td className="px-4 py-3 hidden md:table-cell text-slate-500">{t.companyDisplayName}</td>
                                  <td className="px-4 py-3 text-center font-bold text-slate-700">{t.applicantsCount || 0}</td>
                                  <td className="px-4 py-3 hidden lg:table-cell text-slate-400">{fmtDate(t.deadline)}</td>
                                  <td className="px-4 py-3 text-center"><StatusBadge status={t.status} /></td>
                                  <td className="px-4 py-3 text-right">
                                    <IoChevronForwardOutline size={14} className="text-slate-300 ml-auto" />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                    </div>
                  )}

                  {/* ── Submissions tab ── */}
                  {activeTab === 'submissions' && (
                    <div className="overflow-x-auto">
                      {filteredSubmissions.length === 0
                        ? <EmptyState icon="📄" message="No submissions yet" />
                        : (
                          <table className="w-full text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wide">
                              <tr>
                                <th className="px-4 py-3 text-left">Candidate</th>
                                <th className="px-4 py-3 text-left">Task</th>
                                <th className="px-4 py-3 text-left hidden lg:table-cell">Submitted</th>
                                <th className="px-4 py-3 text-center">Score</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-center">Links</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {filteredSubmissions.map(s => (
                                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <Avatar name={s.candidateDisplayName} size={6} />
                                      <span className="font-semibold text-slate-800">{s.candidateDisplayName}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-slate-600 truncate max-w-[160px]">{s.taskTitle}</td>
                                  <td className="px-4 py-3 hidden lg:table-cell text-slate-400">{fmtDate(s.submittedAt)}</td>
                                  <td className="px-4 py-3 text-center font-bold text-slate-700">{s.score ?? '—'}</td>
                                  <td className="px-4 py-3 text-center"><StatusBadge status={s.status} /></td>
                                  <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      {s.githubUrl && (
                                        <a href={s.githubUrl} target="_blank" rel="noopener noreferrer"
                                           onClick={e => e.stopPropagation()}
                                           className="text-slate-500 hover:text-slate-800 transition-colors">
                                          <IoLogoGithub size={15} />
                                        </a>
                                      )}
                                      {s.liveUrl && (
                                        <a href={s.liveUrl} target="_blank" rel="noopener noreferrer"
                                           onClick={e => e.stopPropagation()}
                                           className="text-slate-500 hover:text-primary transition-colors">
                                          <IoOpenOutline size={15} />
                                        </a>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── RIGHT: Detail Panel ── */}
            {selected && (
              <div className="w-[45%] flex-shrink-0 flex flex-col">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    {selected.type === 'company'   ? 'Company Detail' :
                     selected.type === 'candidate' ? 'Candidate Detail' : 'Task Detail'}
                  </h3>
                  <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
                    <IoArrowBackOutline size={16} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

                  {/* ── Company detail ── */}
                  {selected.type === 'company' && (() => {
                    const c = selected.data;
                    const cTasks = enrichedTasks.filter(t => t.companyId === c.uid);
                    return (
                      <>
                        <div className="flex items-center gap-3">
                          <Avatar name={c.companyName || c.name} size={12} />
                          <div>
                            <p className="font-black text-slate-900">{c.companyName || c.name}</p>
                            <p className="text-xs text-slate-500">{c.email}</p>
                            <p className="text-[10px] text-slate-400">Joined {fmtDate(c.createdAt)}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <p className="text-2xl font-black text-slate-900">{c.taskCount}</p>
                            <p className="text-[10px] text-slate-500 font-medium">Tasks Posted</p>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <p className="text-2xl font-black text-slate-900">{c.totalApplicants}</p>
                            <p className="text-[10px] text-slate-500 font-medium">Total Applicants</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Their Tasks</p>
                          {cTasks.length === 0
                            ? <p className="text-xs text-slate-400 text-center py-4">No tasks posted yet</p>
                            : (
                              <div className="flex flex-col gap-2">
                                {cTasks.map(t => (
                                  <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <div>
                                      <p className="text-xs font-semibold text-slate-800">{t.title}</p>
                                      <p className="text-[10px] text-slate-400">{t.applicantsCount || 0} applicants · ${t.reward}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <StatusBadge status={t.status} />
                                      {t.status !== 'inactive' && (
                                        <button
                                          onClick={() => deactivateTask(t.id)}
                                          className="text-[10px] text-red-500 hover:text-red-700 font-bold transition-colors cursor-pointer"
                                        >
                                          Deactivate
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                        {c.active !== false && (
                          <button
                            onClick={() => deactivateUser(c.uid)}
                            className="w-full py-2 text-xs font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer mt-auto"
                          >
                            Deactivate Company Account
                          </button>
                        )}
                      </>
                    );
                  })()}

                  {/* ── Candidate detail ── */}
                  {selected.type === 'candidate' && (() => {
                    const c = selected.data;
                    const cApps = rawApplications.filter(a => a.candidateId === c.uid);
                    const cSubs = rawSubmissions.filter(s => s.candidateId === c.uid);
                    return (
                      <>
                        <div className="flex items-center gap-3">
                          <Avatar name={c.name} size={12} />
                          <div>
                            <p className="font-black text-slate-900">{c.name}</p>
                            <p className="text-xs text-slate-500">{c.email}</p>
                            <p className="text-[10px] text-slate-400">{c.title || 'Developer'} · {fmtDate(c.createdAt)}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <p className="text-2xl font-black text-slate-900">{c.appCount}</p>
                            <p className="text-[10px] text-slate-500 font-medium">Applications</p>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <p className="text-2xl font-black text-slate-900">{c.subCount}</p>
                            <p className="text-[10px] text-slate-500 font-medium">Submissions</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Application History</p>
                          {cApps.length === 0
                            ? <p className="text-xs text-slate-400 text-center py-4">No applications yet</p>
                            : (
                              <div className="flex flex-col gap-2">
                                {cApps.map(a => {
                                  const task = rawTasks.find(t => t.id === a.taskId);
                                  return (
                                    <div key={a.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                      <div>
                                        <p className="text-xs font-semibold text-slate-800">{task?.title || a.taskId}</p>
                                        <p className="text-[10px] text-slate-400">Applied {fmtDate(a.appliedAt)}</p>
                                      </div>
                                      <StatusBadge status={a.status} />
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                        </div>
                        {cSubs.length > 0 && (
                          <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Submissions</p>
                            <div className="flex flex-col gap-2">
                              {cSubs.map(s => (
                                <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                  <div>
                                    <p className="text-xs font-semibold text-slate-800">{s.taskTitle || '—'}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {s.githubUrl && (
                                        <a href={s.githubUrl} target="_blank" rel="noopener noreferrer"
                                           className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-0.5">
                                          <IoLogoGithub size={11}/> GitHub
                                        </a>
                                      )}
                                      {s.score && <span className="text-[10px] text-emerald-600 font-bold">Score: {s.score}</span>}
                                    </div>
                                  </div>
                                  <StatusBadge status={s.status} />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {c.active !== false && (
                          <button
                            onClick={() => deactivateUser(c.uid)}
                            className="w-full py-2 text-xs font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer mt-auto"
                          >
                            Deactivate Candidate Account
                          </button>
                        )}
                      </>
                    );
                  })()}

                  {/* ── Task detail ── */}
                  {selected.type === 'task' && (() => {
                    const t = selected.data;
                    const taskSubs = rawSubmissions.filter(s => s.taskId === t.id);
                    return (
                      <>
                        <div>
                          <p className="font-black text-slate-900 text-sm leading-tight">{t.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{t.companyDisplayName} · {t.difficulty} · ${t.reward} reward</p>
                          <div className="flex items-center gap-2 mt-2">
                            <StatusBadge status={t.status} />
                            {t.tags?.map(tag => (
                              <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{tag}</span>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <p className="text-xl font-black text-slate-900">{t.applicantsCount || 0}</p>
                            <p className="text-[10px] text-slate-500">Applicants</p>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <p className="text-xl font-black text-slate-900">{taskSubs.length}</p>
                            <p className="text-[10px] text-slate-500">Submissions</p>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <p className="text-xl font-black text-slate-900">${t.reward}</p>
                            <p className="text-[10px] text-slate-500">Reward</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Applicants & Submissions</p>
                          {taskSubs.length === 0
                            ? <p className="text-xs text-slate-400 text-center py-4">No submissions yet</p>
                            : (
                              <div className="flex flex-col gap-2">
                                {taskSubs.map(s => (
                                  <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-2">
                                      <Avatar name={s.candidateName || s.candidateDisplayName} size={6} />
                                      <div>
                                        <p className="text-xs font-semibold text-slate-800">{s.candidateName || '—'}</p>
                                        <p className="text-[10px] text-slate-400">{fmtDate(s.submittedAt)}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <StatusBadge status={s.status} />
                                      {s.githubUrl && (
                                        <a href={s.githubUrl} target="_blank" rel="noopener noreferrer"
                                           className="text-slate-400 hover:text-slate-700 transition-colors">
                                          <IoLogoGithub size={14}/>
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                        {t.status !== 'inactive' && (
                          <button
                            onClick={() => deactivateTask(t.id)}
                            className="w-full py-2 text-xs font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer mt-auto"
                          >
                            Deactivate Task
                          </button>
                        )}
                      </>
                    );
                  })()}

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
