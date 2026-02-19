import { useState, useEffect } from 'react';
import { getOverviewStats, getGradeStats, getAttendanceStats } from '../../services/api';
import Card from '../../components/UI/Card';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Statistics = () => {
  const [stats, setStats] = useState({ overview: null, grades: null, attendance: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [overview, grades, attendance] = await Promise.all([
        getOverviewStats(),
        getGradeStats(),
        getAttendanceStats()
      ]);
      setStats({
        overview: overview.data.stats,
        grades: grades.data.stats,
        attendance: attendance.data.stats
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading statistics...</div>;
  }

  const gradeChartData = {
    labels: stats.grades?.distribution.map(d => d.range) || [],
    datasets: [{
      label: 'Number of Students',
      data: stats.grades?.distribution.map(d => d.count) || [],
      backgroundColor: ['#61ABE0', '#173686', '#FAD907', '#F08E03', '#EF2200'],
      borderWidth: 0
    }]
  };

  const attendanceChartData = {
    labels: ['Present', 'Absent', 'Late', 'Excused'],
    datasets: [{
      data: [
        stats.attendance?.present || 0,
        stats.attendance?.absent || 0,
        stats.attendance?.late || 0,
        stats.attendance?.excused || 0
      ],
      backgroundColor: ['#FAD907', '#EF2200', '#F08E03', '#61ABE0'],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="!p-4 text-center">
          <p className="text-3xl font-bold text-primary">{stats.overview?.totalStudents || 0}</p>
          <p className="text-sm text-gray-500">Students</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-3xl font-bold text-secondary">{stats.overview?.totalTeachers || 0}</p>
          <p className="text-sm text-gray-500">Teachers</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-3xl font-bold text-warning">{stats.overview?.totalParents || 0}</p>
          <p className="text-sm text-gray-500">Parents</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-3xl font-bold text-success">{stats.overview?.totalLevels || 0}</p>
          <p className="text-sm text-gray-500">Levels</p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Grade Distribution" subtitle="Students by grade range">
          <div className="h-64">
            <Bar data={gradeChartData} options={chartOptions} />
          </div>
        </Card>

        <Card title="Attendance Overview" subtitle="Overall attendance rate">
          <div className="h-64 flex items-center justify-center">
            <div className="w-48 h-48">
              <Doughnut data={attendanceChartData} options={chartOptions} />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-success">{stats.attendance?.percentage || 0}%</p>
              <p className="text-sm text-gray-500">Attendance Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{stats.attendance?.total || 0}</p>
              <p className="text-sm text-gray-500">Total Records</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Grade Stats */}
      <Card title="Grade Statistics">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-primary">{stats.grades?.average || 0}%</p>
            <p className="text-sm text-gray-500">Average Grade</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-success">{stats.grades?.highest || 0}%</p>
            <p className="text-sm text-gray-500">Highest Grade</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-danger">{stats.grades?.lowest || 0}%</p>
            <p className="text-sm text-gray-500">Lowest Grade</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Statistics;
