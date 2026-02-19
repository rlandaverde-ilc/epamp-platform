import { useAuth } from '../../context/AuthContext';

const Header = ({ title }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
          <p className="text-sm text-gray-500">
            Welcome back, {user?.firstName} {user?.lastName}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Logo Placeholder */}
          <div className="w-40 h-12 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-xs">Institution Logo</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
