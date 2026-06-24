import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Trophy, TrendingUp, Award, Clock } from 'lucide-react';

const Scorecard = () => {
  const [councillors, setCouncillors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScorecard = async () => {
      try {
        const response = await api.get('/councillor');
        setCouncillors(response.data.data);
      } catch (error) {
        console.error('Error fetching scorecard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchScorecard();
  }, []);

  if (loading) {
    return <div className="text-center mt-20">Loading Scorecard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 mt-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 flex justify-center items-center gap-3">
          <Trophy className="text-yellow-500" size={40} />
          Transparency Scorecard
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Public ranking of all ward councillors based on response time, resolution rate, and citizen satisfaction.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Ward & Councillor
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Transparency Score
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Issues Resolved
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Avg Response Time
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {councillors.map((councillor, index) => (
              <tr key={councillor._id || index} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`text-xl font-bold ${index < 3 ? 'text-yellow-500' : 'text-gray-500'}`}>
                      #{index + 1}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">{councillor.name}</div>
                  <div className="text-sm text-gray-500">Ward {councillor.wardId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${councillor.transparencyScore}%` }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{councillor.transparencyScore}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Award size={16} className="text-blue-500" />
                    <span>{councillor.issuesResolved} / {councillor.totalIssuesReported}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock size={16} className="text-orange-500" />
                    <span>{councillor.averageResponseTimeHours} hrs</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {councillors.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No data available yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Scorecard;
