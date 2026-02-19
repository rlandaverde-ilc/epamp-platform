import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getOverviewStats, getGradeStats } from '../../services/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await getOverviewStats();
      setStats(res.data.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Students', value: stats?.totalStudents || 0, color: 'primary', icon: '👨‍🎓' },
    { label: 'Teachers', value: stats?.totalTeachers || 0, color: 'secondary', icon: '👩‍🏫' },
    { label: 'Parents', value: stats?.totalParents || 0, color: 'warning', icon: '👨‍👩‍👧' },
    { label: 'Levels', value: stats?.totalLevels || 0, color: 'success', icon: '📚' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <Card key={idx} className="!p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Payment Status & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Overview */}
        <Card title="Payment Status" subtitle="Student payment overview">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
              <span className="text-gray-700">Paid Students</span>
              <Badge variant="success">{stats?.paidStudents || 0}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-danger/10 rounded-lg">
              <span className="text-gray-700">Unpaid Students</span>
              <Badge variant="danger">{stats?.unpaidStudents || 0}</Badge>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/admin/users')}
            >
              Manage Payments
            </Button>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="primary" onClick={() => navigate('/admin/users')}>
              👥 Add User
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/levels')}>
              📚 Manage Levels
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/statistics')}>
              📈 View Statistics
            </Button>
            <Button variant="ghost">
              ⚙️ Settings
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Students */}
      <Card title="Recent Registrations" subtitle="Latest student accounts">
        {stats?.recentStudents?.length > 0 ? (
          <div className="space-y-3">
            {stats.recentStudents.map((student, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {student.firstName[0]}{student.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{student.firstName} {student.lastName}</p>
                    <p className="text-sm text-gray-500">{student.email}</p>
                  </div>
                </div>
                <Badge>{student.level?.name || 'No Level'}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent registrations</p>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;
