import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentGrades } from '../../services/api';
import Card from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';

const StudentGrades = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    try {
      const res = await getStudentGrades(user.id);
      setGrades(res.data.grades);
    } catch (error) {
      console.error('Error loading grades:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  // Calculate average
  const total = grades.reduce((sum, g) => sum + g.grade, 0);
  const average = grades.length > 0 ? Math.round(total / grades.length) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">My Grades</h2>
            <p className="text-sm text-gray-500">{grades.length} total grade entries</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Current Average</p>
            <p className={`text-3xl font-bold ${
              average >= 70 ? 'text-success' : 'text-danger'
            }`}>
              {average}%
            </p>
          </div>
        </div>

        {grades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Course</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Grade</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Semester</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Teacher</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {grades.map((grade, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium">{grade.course?.name || 'N/A'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-2xl font-bold">{grade.grade}%</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{grade.semester}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {grade.teacher?.firstName} {grade.teacher?.lastName}
                    </td>
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
          <div className="text-center py-12 text-gray-500">
            No grades recorded yet
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentGrades;
