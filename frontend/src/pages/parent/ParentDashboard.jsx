import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentGrades, getStudentAttendance } from '../../services/api';
import Card from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';

const ParentDashboard = () => {
  const { user } = useAuth();
  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get first child for demo
    loadChildData();
  }, []);

  const loadChildData = async () => {
    try {
      // In a real app, you'd get the child ID from the user's children array
      // For demo, we'll assume there's a child linked
      const childId = user.children?.[0]?._id || user.children?.[0];
      
      if (childId) {
        const [gradesRes, attRes] = await Promise.all([
          getStudentGrades(childId),
          getStudentAttendance(childId)
        ]);
        
        setChildData({
          grades: gradesRes.data.grades,
          attendance: attRes.data
        });
      }
    } catch (error) {
      console.error('Error loading child data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const child = user.children?.[0];

  return (
    <div className="space-y-6">
      {/* Child Info */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {child?.firstName?.[0]}{child?.lastName?.[0]}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {child?.firstName} {child?.lastName}
            </h2>
            <p className="text-gray-500">{child?.email}</p>
            <p className="text-sm text-gray-500">Level: {child?.level?.name || 'Not assigned'}</p>
          </div>
          <div className="ml-auto">
            <Badge variant={child?.paymentStatus === 'paid' ? 'success' : 'danger'}>
              {child?.paymentStatus || 'unpaid'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Alerts */}
      {childData?.grades && (
        (() => {
          const avg = childData.grades.reduce((s, g) => s + g.grade, 0) / childData.grades.length;
          if (avg < 70) {
            return (
              <Card className="!border-l-4 !border-l-danger">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h3 className="font-semibold text-danger">Academic Alert</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Your child's average grade is below 70%. Please contact the school to discuss ways to help improve their performance.
                    </p>
                  </div>
                </div>
              </Card>
            );
          }
          return null;
        })()
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">
            {childData?.grades?.length || 0}
          </p>
          <p className="text-sm text-gray-500">Grades</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-success">
            {childData?.attendance?.stats?.percentage || 0}%
          </p>
          <p className="text-sm text-gray-500">Attendance</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-primary">
            {childData?.grades?.length > 0 
              ? Math.round(childData.grades.reduce((s, g) => s + g.grade, 0) / childData.grades.length)
              : 0}%
          </p>
          <p className="text-sm text-gray-500">Average</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-warning">
            {childData?.attendance?.stats?.absent || 0}
          </p>
          <p className="text-sm text-gray-500">Absences</p>
        </Card>
      </div>

      {/* Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" onClick={() => window.location.href = '/parent/child'}>
            📊 View Progress
          </Button>
          <Button variant="ghost">
            💬 Contact Teacher
          </Button>
          <Button variant="ghost">
            📥 Download Report
          </Button>
          <Button variant="ghost">
            💳 Payment
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ParentDashboard;
