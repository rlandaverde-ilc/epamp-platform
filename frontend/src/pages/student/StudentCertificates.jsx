import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCertificates, requestCertificate, getLevels, getStudentAverage } from '../../services/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';

const StudentCertificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [levels, setLevels] = useState([]);
  const [average, setAverage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [certRes, levelsRes, avgRes] = await Promise.all([
        getCertificates(),
        getLevels(),
        getStudentAverage(user.id)
      ]);
      setCertificates(certRes.data.certificates);
      setLevels(levelsRes.data.levels);
      setAverage(avgRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async () => {
    if (!selectedLevel) return;
    
    setRequesting(true);
    try {
      await requestCertificate({ level: selectedLevel });
      setShowModal(false);
      setSelectedLevel('');
      loadData();
      alert('Certificate request submitted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error requesting certificate');
    } finally {
      setRequesting(false);
    }
  };

  const handleDownload = async (cert) => {
    try {
      const response = await fetch(`/api/certificates/${cert._id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        // Generate certificate PDF
        const reportResponse = await fetch(`/api/reports/student/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const blob = await reportResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate_${user.firstName}_${user.lastName}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const canRequest = average && average.average >= 70;

  return (
    <div className="space-y-6">
      {/* Eligibility Status */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Certificate Eligibility</h2>
            <p className="text-sm text-gray-500 mt-1">
              Current average: <span className="font-medium">{average?.average || 0}%</span>
            </p>
          </div>
          <div className="text-right">
            {canRequest ? (
              <Badge variant="success" className="text-lg px-4 py-2">
                ✓ Eligible
              </Badge>
            ) : (
              <Badge variant="danger" className="text-lg px-4 py-2">
                ✗ Not Eligible (Need 70%)
              </Badge>
            )}
          </div>
        </div>
        {canRequest && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Button variant="primary" onClick={() => setShowModal(true)}>
              🎓 Request Certificate
            </Button>
          </div>
        )}
      </Card>

      {/* Certificates List */}
      <Card title="My Certificates" subtitle={`${certificates.length} certificate(s)`}>
        {certificates.length > 0 ? (
          <div className="space-y-4">
            {certificates.map((cert, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-800">{cert.level?.name}</h3>
                  <p className="text-sm text-gray-500">
                    Issued: {new Date(cert.issueDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400">Certificate #: {cert.certificateNumber}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={
                    cert.status === 'approved' ? 'success' : 
                    cert.status === 'issued' ? 'secondary' : 'warning'
                  }>
                    {cert.status}
                  </Badge>
                  {cert.status === 'approved' && (
                    <Button size="sm" variant="primary" onClick={() => handleDownload(cert)}>
                      Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-4">🎓</p>
            <p>No certificates yet</p>
            <p className="text-sm mt-1">Complete your courses to request certificates</p>
          </div>
        )}
      </Card>

      {/* Request Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Request Certificate">
        <div className="space-y-4">
          <p className="text-gray-600">
            You are eligible to request a certificate! Select the level you have completed.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Select a level</option>
              {levels.map(level => (
                <option key={level._id} value={level._id}>{level.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleRequest} 
              disabled={!selectedLevel || requesting}
              className="flex-1"
            >
              {requesting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentCertificates;
