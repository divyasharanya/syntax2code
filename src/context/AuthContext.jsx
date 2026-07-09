import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DEFAULT_USERS = [
  {
    id: 'user_cand_1',
    name: 'Alex Rivera',
    email: 'candidate@microintern.com',
    password: 'password',
    role: 'candidate',
    title: 'Frontend Engineer',
    bio: 'Passionate developer specializing in React, Next.js, and CSS animations. Building responsive and highly aesthetic user interfaces.',
    skills: ['React', 'JavaScript', 'Tailwind CSS', 'CSS v4', 'Node.js', 'Git'],
    portfolioUrl: 'https://github.com/alexrivera',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    points: 350,
  },
  {
    id: 'user_comp_1',
    name: 'Sarah Chen',
    email: 'company@stripe.com',
    password: 'password',
    role: 'company',
    companyName: 'Stripe',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    companyUrl: 'https://stripe.com',
    bio: 'Stripe is a financial infrastructure platform for the internet. Millions of companies use Stripe to accept payments and manage their businesses.',
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('microintern_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const activeSession = localStorage.getItem('microintern_session');
    if (activeSession) {
      setUser(JSON.parse(activeSession));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('microintern_users', JSON.stringify(users));
  }, [users]);

  const login = (email, password) => {
    setError('');
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      // Remove password from active session state
      const { password: _, ...sessionUser } = foundUser;
      setUser(sessionUser);
      localStorage.setItem('microintern_session', JSON.stringify(sessionUser));
      return { success: true };
    } else {
      setError('Invalid email or password');
      return { success: false, error: 'Invalid email or password' };
    }
  };

  const register = (registerData) => {
    setError('');
    const { name, email, password, role, companyName, title } = registerData;

    const emailExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      setError('An account with this email already exists.');
      return { success: false, error: 'Email already exists' };
    }

    const newUser = {
      id: `user_${role === 'candidate' ? 'cand' : 'comp'}_${Date.now()}`,
      name,
      email,
      password,
      role,
      bio: '',
      ...(role === 'candidate'
        ? {
            title: title || 'Developer',
            skills: [],
            portfolioUrl: '',
            avatar: `https://images.unsplash.com/photo-${role === 'candidate' ? '1535713875002-d1d0cf377fde' : '1570295999919-56ceb5ecca61'}?w=150&auto=format&fit=crop&q=80`,
            points: 0,
          }
        : {
            companyName: companyName || 'My Startup',
            companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80',
            companyUrl: '',
          }),
    };

    setUsers((prev) => [...prev, newUser]);
    
    // Auto-login after registration
    const { password: _, ...sessionUser } = newUser;
    setUser(sessionUser);
    localStorage.setItem('microintern_session', JSON.stringify(sessionUser));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('microintern_session');
  };

  const updateProfile = (updatedFields) => {
    if (!user) return { success: false };

    // Update session state
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);
    localStorage.setItem('microintern_session', JSON.stringify(updatedUser));

    // Update in users repository
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === user.id ? { ...u, ...updatedFields } : u))
    );

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
