import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentAverage, getGrades, getStudentAttendance, getCertificates, getLevels } from '../../services/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [average, setAverage] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [avgRes, attRes, certRes] = await Promise.all([
        getStudentAverage(user.id),
        getStudentAttendance(user.id),
        getCertificates()
      ]);
      setAverage(avgRes.data);
      setAttendance(attRes.data.stats);
      setCertificates(certRes.data.certificates);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      const response = await fetch(`/api/reports/student/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `progress_report_${user.firstName}_${user.lastName}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const getStatusVariant = () => {
    if (!average || average.totalGrades === 0) return 'default';
    if (average.average >= 90) return 'secondary';
    if (average.average >= 70) return 'success';
    return 'danger';
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Welcome, {user.firstName}!
              </h2>
              <p className="text-gray-500 mt-1">
                Level: {user.level?.name || 'Not assigned'}
              </p>
            </div>
            <div className="text-center px-6 py-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Average Grade</p>
              <p className="text-4xl font-bold text-primary">{average?.average || 0}%</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Current Status</p>
            <Badge variant={getStatusVariant()} className="text-lg px-4 py-2">
              {average?.status || 'No grades'}
            </Badge>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Button variant="primary" className="w-full" onClick={downloadReport}>
              📥 Download PDF Report
            </Button>
          </div>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{average?.totalGrades || 0}</p>
          <p className="text-sm text-gray-500">Total Grades</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-success">{attendance?.percentage || 0}%</p>
          <p className="text-sm text-gray-500">Attendance</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-secondary">{certificates.length}</p>
          <p className="text-sm text-gray-500">Certificates</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-warning">{user.paymentStatus === 'paid' ? '✓' : '✗'}</p>
          <p className="text-sm text-gray-500">Payment</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" onClick={() => window.location.href = '/student/grades'}>
            📝 View Grades
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/student/attendance'}>
            ✅ Attendance
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/student/certificates'}>
            🎓 Certificates
          </Button>
          <Button variant="ghost">
            💬 Messages
          </Button>
        </div>
      </Card>

      {/* Alerts */}
      {average?.average < 70 && (
        <Card className="!border-l-4 !border-l-danger">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-danger">Academic Alert</h3>
              <p className="text-sm text-gray-600 mt-1">
                Your average grade is below 70%. Please contact your teacher to discuss ways to improve your performance.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentDashboard;
