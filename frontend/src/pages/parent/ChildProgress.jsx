import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentGrades, getStudentAttendance, generateStudentReport } from '../../services/api';
import Card from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';
import Button from '../../components/UI/Button';

const ChildProgress = () => {
  const { user } = useAuth();
  const [child, setChild] = useState(null);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildData();
  }, []);

  const loadChildData = async () => {
    try {
      const childId = user.children?.[0]?._id || user.children?.[0];
      
      if (childId) {
        const child = user.children[0];
        setChild(child);
        
        const [gradesRes, attRes] = await Promise.all([
          getStudentGrades(childId),
          getStudentAttendance(childId)
        ]);
        
        setGrades(gradesRes.data.grades);
        setAttendance(attRes.data);
      }
    } catch (error) {
      console.error('Error loading child data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      const childId = user.children?.[0]?._id || user.children?.[0];
      const response = await fetch(`/api/reports/student/${childId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `progress_report_${child.firstName}_${child.lastName}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const average = grades.length > 0 
    ? Math.round(grades.reduce((s, g) => s + g.grade, 0) / grades.length)
    : 0;

  const statusColors = {
    present: 'success',
    absent: 'danger',
    late: 'warning',
    excused: 'secondary'
  };

  return (
    <div className="space-y-6">
      {/* Child Info & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                {child?.firstName?.[0]}{child?.lastName?.[0]}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {child?.firstName} {child?.lastName}
                </h2>
                <p className="text-gray-500">Level: {child?.level?.name || 'Not assigned'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Average Grade</p>
              <p className={`text-4xl font-bold ${average >= 70 ? 'text-success' : 'text-danger'}`}>
                {average}%
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-center mb-4">
            <Badge variant={average >= 70 ? 'success' : 'danger'} className="text-lg px-4 py-2">
              {average >= 70 ? 'Approved' : 'At Risk'}
            </Badge>
          </div>
          <Button variant="primary" className="w-full" onClick={downloadReport}>
            📥 Download Report
          </Button>
        </Card>
      </div>

      {/* Grades */}
      <Card title="Academic Grades" subtitle={`${grades.length} grade entries`}>
        {grades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Course</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Grade</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Semester</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {grades.map((grade, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{grade.course?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-2xl font-bold">{grade.grade}%</td>
                    <td className="py-3 px-4 text-gray-600">{grade.semester}</td>
                    <td className="py-3 px-4">
                      <Badge variant={grade.grade >= 70 ? 'success' : 'danger'}>
                        {grade.grade >= 70 ? 'Approved' : 'At Risk'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 text-gray-500">No grades recorded yet</p>
        )}
      </Card>

      {/* Attendance */}
      <Card title="Attendance Record">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">{attendance?.stats?.total || 0}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
          <div className="text-center p-4 bg-success/10 rounded-lg">
            <p className="text-2xl font-bold text-success">{attendance?.stats?.present || 0}</p>
            <p className="text-sm text-gray-500">Present</p>
          </div>
          <div className="text-center p-4 bg-danger/10 rounded-lg">
            <p className="text-2xl font-bold text-danger">{attendance?.stats?.absent || 0}</p>
            <p className="text-sm text-gray-500">Absent</p>
          </div>
          <div className="text-center p-4 bg-warning/10 rounded-lg">
            <p className="text-2xl font-bold text-warning">{attendance?.stats?.late || 0}</p>
            <p className="text-sm text-gray-500">Late</p>
          </div>
          <div className="text-center p-4 bg-secondary/10 rounded-lg">
            <p className="text-2xl font-bold text-secondary">{attendance?.stats?.percentage || 0}%</p>
            <p className="text-sm text-gray-500">Rate</p>
          </div>
        </div>

        {attendance?.attendance?.length > 0 && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Course</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendance.attendance.slice(0, 10).map((record, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{record.course?.name || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <Badge variant={statusColors[record.status]}>{record.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ChildProgress;
