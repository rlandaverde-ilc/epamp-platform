import { useState, useEffect } from 'react';
import { getStudents, getAttendance, recordAttendance } from '../../services/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';

const AttendanceManagement = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsRes, attendanceRes] = await Promise.all([
        getStudents(),
        getAttendance()
      ]);
      setStudents(studentsRes.data.students);
      setAttendance(attendanceRes.data.attendance);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      const records = Object.entries(attendanceRecords)
        .filter(([_, status]) => status)
        .map(([studentId, status]) => ({
          student: studentId,
          status
        }));

      if (records.length === 0) {
        alert('Please select attendance status for at least one student');
        return;
      }

      await recordAttendance({
        date: selectedDate,
        course: 'default',
        records
      });

      setShowModal(false);
      setAttendanceRecords({});
      loadData();
    } catch (error) {
      console.error('Error saving attendance:', error);
    }
  };

  const statusColors = {
    present: 'success',
    absent: 'danger',
    late: 'warning',
    excused: 'secondary'
  };

  // Get today's attendance for display
  const todayAttendance = attendance.filter(a => 
    new Date(a.date).toISOString().split('T')[0] === selectedDate
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Attendance Management</h2>
        <div className="flex gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Take Attendance
          </Button>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-success">{todayAttendance.filter(a => a.status === 'present').length}</p>
          <p className="text-sm text-gray-500">Present</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-danger">{todayAttendance.filter(a => a.status === 'absent').length}</p>
          <p className="text-sm text-gray-500">Absent</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-warning">{todayAttendance.filter(a => a.status === 'late').length}</p>
          <p className="text-sm text-gray-500">Late</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-secondary">{todayAttendance.filter(a => a.status === 'excused').length}</p>
          <p className="text-sm text-gray-500">Excused</p>
        </Card>
      </div>

      {/* Attendance Records */}
      <Card title="Attendance Records" subtitle={`Showing ${todayAttendance.length} records for ${selectedDate}`}>
        {todayAttendance.length > 0 ? (
          <div className="space-y-3">
            {todayAttendance.map((record, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium">{record.student?.firstName} {record.student?.lastName}</p>
                  <p className="text-sm text-gray-500">{record.course?.name}</p>
                </div>
                <Badge variant={statusColors[record.status]}>{record.status}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No attendance records for this date</p>
        )}
      </Card>

      {/* Take Attendance Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Take Attendance" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Students</p>
            {students.map(student => (
              <div key={student._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{student.firstName} {student.lastName}</span>
                <div className="flex gap-2">
                  {['present', 'absent', 'late', 'excused'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(student._id, status)}
                      className={`px-3 py-1 rounded text-sm ${
                        attendanceRecords[student._id] === status
                          ? statusColors[status] === 'success' ? 'bg-success text-gray-900'
                          : statusColors[status] === 'danger' ? 'bg-danger text-white'
                          : statusColors[status] === 'warning' ? 'bg-warning text-white'
                          : 'bg-secondary text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveAttendance} className="flex-1">
              Save Attendance
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AttendanceManagement;
