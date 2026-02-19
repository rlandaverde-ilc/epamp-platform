import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    // Admin menu
    ...(hasRole('admin') ? [
      { path: '/admin', label: 'Dashboard', icon: '📊' },
      { path: '/admin/users', label: 'User Management', icon: '👥' },
      { path: '/admin/levels', label: 'Manage Levels', icon: '📚' },
      { path: '/admin/statistics', label: 'Statistics', icon: '📈' },
    ] : []),
    
    // Teacher menu
    ...(hasRole('teacher') ? [
      { path: '/teacher', label: 'Dashboard', icon: '📊' },
      { path: '/teacher/grades', label: 'Grade Management', icon: '📝' },
      { path: '/teacher/attendance', label: 'Attendance', icon: '✅' },
    ] : []),
    
    // Student menu
    ...(hasRole('student') ? [
      { path: '/student', label: 'Dashboard', icon: '📊' },
      { path: '/student/grades', label: 'My Grades', icon: '📝' },
      { path: '/student/attendance', label: 'Attendance', icon: '✅' },
      { path: '/student/certificates', label: 'Certificates', icon: '🎓' },
    ] : []),
    
    // Parent menu
    ...(hasRole('parent') ? [
      { path: '/parent', label: 'Dashboard', icon: '📊' },
      { path: '/parent/child', label: "Child's Progress", icon: '👶' },
    ] : []),
  ];

  return (
    <aside className="w-64 bg-primary text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold">EPAMP</h1>
        <p className="text-sm text-white/70">English Program</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-sm font-medium">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-white/60 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
