import { useState, useEffect } from 'react';
import { getLevels, createLevel, updateLevel, deleteLevel } from '../../services/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Table from '../../components/UI/Table';
import Modal from '../../components/UI/Modal';

const LevelManagement = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'kids',
    order: 1,
    description: ''
  });

  useEffect(() => {
    loadLevels();
  }, []);

  const loadLevels = async () => {
    try {
      const res = await getLevels();
      setLevels(res.data.levels);
    } catch (error) {
      console.error('Error loading levels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLevel) {
        await updateLevel(editingLevel._id, formData);
      } else {
        await createLevel(formData);
      }
      setShowModal(false);
      setEditingLevel(null);
      resetForm();
      loadLevels();
    } catch (error) {
      console.error('Error saving level:', error);
    }
  };

  const handleEdit = (level) => {
    setEditingLevel(level);
    setFormData({
      name: level.name,
      category: level.category,
      order: level.order,
      description: level.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this level?')) {
      try {
        await deleteLevel(id);
        loadLevels();
      } catch (error) {
        console.error('Error deleting level:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'kids',
      order: 1,
      description: ''
    });
  };

  const categoryLabels = {
    kids: 'Kids (4-12)',
    teens: 'Teens (13-17)',
    conversation: 'Conversation',
    'kids4-6': 'Kids 4-6'
  };

  const categoryColors = {
    kids: 'primary',
    teens: 'secondary',
    conversation: 'warning',
    'kids4-6': 'success'
  };

  const columns = [
    { header: 'Level Name', accessor: 'name', render: (row) => (
      <span className="font-medium">{row.name}</span>
    )},
    { header: 'Category', render: (row) => (
      <Badge variant={categoryColors[row.category]}>{categoryLabels[row.category]}</Badge>
    )},
    { header: 'Order', accessor: 'order' },
    { header: 'Status', render: (row) => (
      <Badge variant={row.isActive ? 'success' : 'default'}>
        {row.isActive ? 'Active' : 'Inactive'}
      </Badge>
    )},
    { header: 'Actions', width: '200px', render: (row) => (
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => handleEdit(row)}>Edit</Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}>Delete</Button>
      </div>
    )}
  ];

  // Group levels by category
  const groupedLevels = levels.reduce((acc, level) => {
    if (!acc[level.category]) acc[level.category] = [];
    acc[level.category].push(level);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Program Levels</h2>
        <Button onClick={() => { resetForm(); setEditingLevel(null); setShowModal(true); }}>
          + Add Level
        </Button>
      </div>

      {/* Category Cards */}
      {Object.entries(groupedLevels).map(([category, categoryLevels]) => (
        <Card key={category} title={categoryLabels[category]} subtitle={`${categoryLevels.length} levels`}>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categoryLevels.map((level) => (
              <div 
                key={level._id}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => handleEdit(level)}
              >
                <p className="font-medium text-sm text-gray-800">{level.name}</p>
                <p className="text-xs text-gray-500">Order: {level.order}</p>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingLevel ? 'Edit Level' : 'Add Level'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="e.g., Kids Level 1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="kids">Kids</option>
                <option value="teens">Teens</option>
                <option value="conversation">Conversation</option>
                <option value="kids4-6">Kids 4-6</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg"
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              rows="3"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              {editingLevel ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LevelManagement;
