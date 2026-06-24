import React, { useState } from 'react';
import { Mail, Phone, MessageCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../../api/axios'; // Assumes an axios instance is configured

const CouncillorCard = ({ councillor, issueId }) => {
  const [escalating, setEscalating] = useState(false);
  const [escalated, setEscalated] = useState(false);

  const handleEscalate = async () => {
    setEscalating(true);
    try {
      // Escalation API call
      await api.post(`/councillor/escalate/${issueId || 'mock_id'}`, { wardId: councillor.wardId });
      setEscalated(true);
    } catch (error) {
      console.error('Failed to escalate', error);
      alert('Failed to escalate issue.');
    } finally {
      setEscalating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 transition hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{councillor.name}</h3>
          <p className="text-sm font-medium text-blue-600">Ward {councillor.wardId || councillor.ward}</p>
        </div>
        <div className="flex space-x-2">
          <a href={`tel:${councillor.phone}`} className="p-2 bg-gray-50 text-gray-600 rounded-full hover:bg-blue-50 hover:text-blue-600 transition">
            <Phone size={18} />
          </a>
          <a href={`mailto:${councillor.email}`} className="p-2 bg-gray-50 text-gray-600 rounded-full hover:bg-blue-50 hover:text-blue-600 transition">
            <Mail size={18} />
          </a>
          <a href={`https://wa.me/${councillor.whatsapp}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 text-gray-600 rounded-full hover:bg-green-50 hover:text-green-600 transition">
            <MessageCircle size={18} />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 uppercase font-semibold">Resolution Rate</p>
          <p className="text-lg font-bold text-gray-800">{councillor.resolutionRate || 0}%</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 uppercase font-semibold">Avg Response Time</p>
          <p className="text-lg font-bold text-gray-800">{councillor.averageResponseTimeHours || 0} hrs</p>
        </div>
      </div>

      <button
        onClick={handleEscalate}
        disabled={escalating || escalated}
        className={`w-full py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition ${
          escalated 
            ? 'bg-green-100 text-green-700'
            : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
        }`}
      >
        {escalated ? (
          <>
            <CheckCircle size={20} />
            <span>Escalated Successfully</span>
          </>
        ) : (
          <>
            {escalating ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></span>
            ) : (
              <AlertTriangle size={20} />
            )}
            <span>1-Tap Escalate to Councillor</span>
          </>
        )}
      </button>
      
      <p className="text-xs text-center text-gray-400 mt-3">
        * Uses the Community Hero Digital Bridge
      </p>
    </div>
  );
};

export default CouncillorCard;
