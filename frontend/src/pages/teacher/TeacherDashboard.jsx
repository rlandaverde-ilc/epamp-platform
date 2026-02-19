import { useState, useEffect } from 'react';
import { getStudents, getGrades } from '../../services/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';

const TeacherDashboard = () => {
  const [students, setStudents] = useState([]);
  const [recentGrades, setRecentGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsRes, gradesRes] = await Promise.all([
        getStudents(),
        getGrades()
      ]);
      setStudents(studentsRes.data.students);
      setRecentGrades(gradesRes.data.grades.slice(0, 5));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="!p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">👨‍🎓</div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{students.length}</p>
              <p className="text-sm text-gray-500">My Students</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-2xl">📝</div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{recentGrades.length}</p>
              <p className="text-sm text-gray-500">Recent Grades</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-2xl">✅</div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {recentGrades.filter(g => g.grade >= 70).length}
              </p>
              <p className="text-sm text-gray-500">Approved</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="primary" onClick={() => window.location.href = '/teacher/grades'}>
            📝 Add Grade
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/teacher/attendance'}>
            ✅ Take Attendance
          </Button>
          <Button variant="outline">
            💬 Add Comment
          </Button>
          <Button variant="ghost">
            📊 View Reports
          </Button>
        </div>
      </Card>

      {/* Recent Grades */}
      <Card title="Recent Grades" subtitle="Latest grade entries">
        {recentGrades.length > 0 ? (
          <div className="space-y-3">
            {recentGrades.map((grade, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium">{grade.student?.firstName} {grade.student?.lastName}</p>
                  <p className="text-sm text-gray-500">{grade.course?.name}</p>
                </div>
                <div className="text-right">
                  <Badge variant={grade.grade >= 70 ? 'success' : 'danger'}>
                    {grade.grade}%
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">{grade.semester}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No grades recorded yet</p>
        )}
      </Card>
    </div>
  );
};

export default TeacherDashboard;
