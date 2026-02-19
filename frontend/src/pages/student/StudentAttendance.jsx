import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentAttendance } from '../../services/api';
import Card from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';

const StudentAttendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const res = await getStudentAttendance(user.id);
      setAttendance(res.data.attendance);
      setStats(res.data.stats);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const statusColors = {
    present: 'success',
    absent: 'danger',
    late: 'warning',
    excused: 'secondary'
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{stats?.total || 0}</p>
          <p className="text-sm text-gray-500">Total</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-success">{stats?.present || 0}</p>
          <p className="text-sm text-gray-500">Present</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-danger">{stats?.absent || 0}</p>
          <p className="text-sm text-gray-500">Absent</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-warning">{stats?.late || 0}</p>
          <p className="text-sm text-gray-500">Late</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-secondary">{stats?.percentage || 0}%</p>
          <p className="text-sm text-gray-500">Rate</p>
        </Card>
      </div>

      {/* Attendance Records */}
      <Card title="Attendance History" subtitle="Your recent attendance records">
        {attendance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Course</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendance.map((record, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{record.course?.name || 'N/A'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={statusColors[record.status]}>
                        {record.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-sm">
                      {record.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No attendance records found
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentAttendance;
