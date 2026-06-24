import React, { useState } from 'react';
import { Camera, MapPin, Send, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

const FilingDashboard = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'infrastructure',
    address: '',
    wardId: ''
  });
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Assuming we map frontend location data correctly
      const payload = {
        ...formData,
        location: {
          type: 'Point',
          coordinates: [88.3639, 22.5726] // Default mock coords for Kolkata
        }
      };
      
      const response = await api.post('/complaints', payload);
      setSuccessData(response.data.data);
    } catch (error) {
      console.error('Error filing complaint', error);
      alert('Failed to file complaint.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Complaint Auto-Filed Successfully!</h2>
          <p className="text-gray-600 mb-6">Your issue has been bridged to the official portal.</p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <p className="text-sm text-gray-500 mb-1">Official Registration Number</p>
            <p className="text-xl font-mono font-bold text-blue-600">{successData.officialGovId || 'Pending'}</p>
            
            <hr className="my-4" />
            
            <p className="text-sm text-gray-500 mb-1">Target Portal</p>
            <p className="font-medium text-gray-800">{successData.officialPortal || 'Authority Portal'}</p>
            
            <hr className="my-4" />
            
            <p className="text-sm text-gray-500 mb-1">SLA Deadline</p>
            <p className="font-medium text-red-600">
              {new Date(successData.slaDeadline).toLocaleString()}
            </p>
          </div>
          
          <button 
            onClick={() => setSuccessData(null)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            File Another Issue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Auto-File a Complaint</h1>
        <p className="text-gray-600 mt-2">
          Submit your issue here, and Community Hero will automatically file it with the correct government authority.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
          <input 
            type="text" 
            name="title"
            required
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
            placeholder="e.g. Massive pothole on Main Street"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select 
              name="category"
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="infrastructure">Infrastructure</option>
              <option value="roads">Roads & Potholes</option>
              <option value="water">Water Supply</option>
              <option value="electricity">Electricity</option>
              <option value="sanitation">Sanitation</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ward Number</label>
            <input 
              type="text" 
              name="wardId"
              required
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              placeholder="e.g. 64"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin size={18} className="text-gray-400" />
            </div>
            <input 
              type="text" 
              name="address"
              required
              onChange={handleChange}
              className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              placeholder="Full address of the issue"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
          <textarea 
            name="description"
            required
            onChange={handleChange}
            rows="4" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Detailed description..."
          ></textarea>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg flex items-start space-x-3 mb-8 border border-blue-100">
          <AlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
          <div className="text-sm text-blue-800">
            <strong>SLA Tracking Enabled:</strong> Based on your category, a strict Service Level Agreement (SLA) deadline will be attached to this issue. If breached, the issue will auto-escalate.
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 bg-gray-900 text-white rounded-lg font-bold flex justify-center items-center space-x-2 hover:bg-gray-800 transition disabled:opacity-70"
        >
          {loading ? (
             <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
          ) : (
            <>
              <Send size={20} />
              <span>Auto-File with Authority</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default FilingDashboard;
