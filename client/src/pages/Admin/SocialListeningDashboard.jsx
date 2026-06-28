import React, { useEffect, useState } from 'react';
import { Activity, Twitter, Facebook, Youtube, MessageCircle, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import api from "../../api/axios.instance";

const SocialListeningDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Poll for new live reports every 5 seconds
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/listening/reports?status=pending_review');
        setReports(response.data.data);
      } catch (error) {
        console.error('Error fetching social reports', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
    const interval = setInterval(fetchReports, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id, status) => {
    try {
      await api.patch(`/listening/reports/${id}`, { status });
      // Remove from list
      setReports(reports.filter(r => r._id !== id));
    } catch (error) {
      console.error('Action failed', error);
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'twitter': return <Twitter className="text-blue-400" size={20} />;
      case 'facebook': return <Facebook className="text-blue-600" size={20} />;
      case 'youtube': return <Youtube className="text-red-500" size={20} />;
      case 'reddit': return <MessageCircle className="text-orange-500" size={20} />;
      case 'whatsapp': return <MessageCircle className="text-green-500" size={20} />;
      case 'news': return <Activity className="text-gray-700" size={20} />;
      default: return <Activity className="text-gray-500" size={20} />;
    }
  };

  if (loading) return <div className="p-8 text-center">Loading AI Stream...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 mt-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <Activity className="text-blue-600" size={32} />
          Social Listening Engine
        </h1>
        <p className="text-gray-600 mt-2">
          Real-time AI monitoring of social media, news, and WhatsApp forwards. Issues flagged below require human review.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-bold uppercase">Stream Status</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xl font-bold text-gray-800">Live (Kafka)</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-bold uppercase">NLP Engine</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xl font-bold text-gray-800">IndicBERT </span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Active</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-bold uppercase">Pending Review</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{reports.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-bold uppercase">Auto-Verified</p>
          <p className="text-2xl font-bold text-green-600 mt-1">1,245</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Human Review Queue</h2>
      
      {reports.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">Queue is empty. AI is handling the streams.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-6">
              
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  {getPlatformIcon(report.sources[0]?.platform)}
                  <span className="text-sm font-bold text-gray-500 uppercase">
                    {report.sources[0]?.platform}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {new Date(report.createdAt).toLocaleTimeString()}
                  </span>
                  {report.viralityScore > 20 && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold flex items-center gap-1">
                      Trending
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">"{report.title}"</h3>
                <p className="text-gray-600 italic mb-4 border-l-4 border-gray-200 pl-4 py-1">
                  {report.originalText}
                </p>
                
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                    Category: <strong>{report.category}</strong>
                  </div>
                  <div className={`px-3 py-1 rounded-full border ${report.sentiment < -0.5 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                    Sentiment: <strong>{report.sentiment.toFixed(2)}</strong>
                  </div>
                  <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-100">
                    AI Confidence: <strong>{(report.aiConfidence * 100).toFixed(1)}%</strong>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
                <button 
                  onClick={() => handleAction(report._id, 'verified_issue')}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-3 rounded-lg font-bold transition border border-green-200"
                >
                  <CheckCircle size={20} />
                  Verify as Issue
                </button>
                <button 
                  onClick={() => handleAction(report._id, 'rejected')}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-3 rounded-lg font-bold transition border border-red-200"
                >
                  <XCircle size={20} />
                  Discard (Noise)
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SocialListeningDashboard;
