import { useState, useEffect } from 'react';
import { getStudents, getGrades, createGrade, updateGrade, deleteGrade } from '../../services/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Table from '../../components/UI/Table';
import Modal from '../../components/UI/Modal';

const GradeManagement = () => {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [formData, setFormData] = useState({
    student: '',
    grade: '',
    semester: 'Fall 2025',
    comments: ''
  });

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
      setGrades(gradesRes.data.grades);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGrade) {
        await updateGrade(editingGrade._id, formData);
      } else {
        await createGrade(formData);
      }
      setShowModal(false);
      setEditingGrade(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving grade:', error);
    }
  };

  const handleEdit = (grade) => {
    setEditingGrade(grade);
    setFormData({
      student: grade.student?._id || grade.student,
      grade: grade.grade,
      semester: grade.semester,
      comments: grade.comments || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this grade?')) {
      try {
        await deleteGrade(id);
        loadData();
      } catch (error) {
        console.error('Error deleting grade:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      student: '',
      grade: '',
      semester: 'Fall 2025',
      comments: ''
    });
  };

  const columns = [
    { header: 'Student', render: (row) => (
      <div>
        <p className="font-medium">{row.student?.firstName} {row.student?.lastName}</p>
        <p className="text-xs text-gray-500">{row.student?.email}</p>
      </div>
    )},
    { header: 'Course', render: (row) => row.course?.name || '-' },
    { header: 'Grade', render: (row) => (
      <Badge variant={row.grade >= 70 ? 'success' : 'danger'}>
        {row.grade}%
      </Badge>
    )},
    { header: 'Semester', accessor: 'semester' },
    { header: 'Teacher', render: (row) => row.teacher?.firstName + ' ' + row.teacher?.lastName },
    { header: 'Actions', width: '150px', render: (row) => (
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => handleEdit(row)}>Edit</Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}>Delete</Button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Grade Management</h2>
        <Button onClick={() => { resetForm(); setEditingGrade(null); setShowModal(true); }}>
          + Add Grade
        </Button>
      </div>

      <Card>
        <Table 
          columns={columns} 
          data={grades} 
          loading={loading}
          emptyMessage="No grades found"
        />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingGrade ? 'Edit Grade' : 'Add Grade'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <select
              value={formData.student}
              onChange={(e) => setFormData({...formData, student: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">Select Student</option>
              {students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.firstName} {student.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade (%)</label>
              <input
                type="number"
                value={formData.grade}
                onChange={(e) => setFormData({...formData, grade: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg"
                min="0"
                max="100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({...formData, semester: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="Fall 2025">Fall 2025</option>
                <option value="Spring 2026">Spring 2026</option>
                <option value="Summer 2026">Summer 2026</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
            <textarea
              value={formData.comments}
              onChange={(e) => setFormData({...formData, comments: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              rows="3"
              placeholder="Optional teacher comments..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              {editingGrade ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GradeManagement;
