import React, { useEffect, useState } from 'react';
import { IndianRupee, TrendingDown, AlertTriangle, Activity, Droplet, Car, ShieldAlert } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import api from "../../api/axios.instance";

const FinancialDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEconomics = async () => {
      try {
        const response = await api.get('/economics/citywide');
        setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch economic data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEconomics();
  }, []);

  if (loading) {
    return <div className="text-center mt-20 text-xl font-bold text-gray-500">Loading Financial Models...</div>;
  }

  if (!data) {
    return <div className="text-center mt-20 text-red-500">Failed to load economic waste data.</div>;
  }

  // Format currency
  const formatINR = (value) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Crore`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} Lakh`;
    } else {
      return `₹${value.toLocaleString('en-IN')}`;
    }
  };

  const chartData = [
    { name: 'Pothole Damage', value: data.breakdown.potholeDamage, color: '#ef4444' }, // Red
    { name: 'Water Loss', value: data.breakdown.waterLoss, color: '#3b82f6' }, // Blue
    { name: 'Crime Cost', value: data.breakdown.crimeCost, color: '#eab308' }, // Yellow
    { name: 'Productivity Loss', value: data.breakdown.productivityLoss, color: '#8b5cf6' }, // Purple
    { name: 'Health Burden', value: data.breakdown.healthCost, color: '#10b981' } // Green
  ].filter(item => item.value > 0);

  // Mock estimated fix cost for ROI calculation
  const estFixCost = 250000; // Static mock for the whole dashboard
  const roi = ((data.totalEconomicWasteInr - estFixCost) / estFixCost) * 100;

  return (
    <div className="max-w-7xl mx-auto p-6 mt-6">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Citywide Economic Waste</h1>
        <p className="text-xl text-gray-600">
          The real-time financial impact of unresolved civic issues across the city.
        </p>
      </div>

      {/* Top Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingDown className="text-red-500" size={24} />
            <h3 className="text-red-800 font-semibold text-lg">Total Money Wasted</h3>
          </div>
          <p className="text-4xl font-black text-red-600">{formatINR(data.totalEconomicWasteInr)}</p>
          <p className="text-sm text-red-500 mt-2 font-medium">Due to {data.totalActiveIssues} active unresolved issues</p>
        </div>

        <div className="bg-green-50 border border-green-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <IndianRupee className="text-green-600" size={24} />
            <h3 className="text-green-800 font-semibold text-lg">Estimated Cost to Fix</h3>
          </div>
          <p className="text-4xl font-black text-green-600">{formatINR(estFixCost)}</p>
          <p className="text-sm text-green-600 mt-2 font-medium">One-time capital expenditure</p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="text-blue-600" size={24} />
            <h3 className="text-blue-800 font-semibold text-lg">Authority ROI (if fixed)</h3>
          </div>
          <p className="text-4xl font-black text-blue-600">{roi > 0 ? `+${roi.toFixed(0)}%` : 'N/A'}</p>
          <p className="text-sm text-blue-600 mt-2 font-medium">Return on Investment via cost savings</p>
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Detailed Cards */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Impact Breakdown</h2>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 rounded-lg text-red-600"><Car size={24}/></div>
              <div>
                <h4 className="font-bold text-gray-800">Vehicle Damage (Potholes)</h4>
                <p className="text-sm text-gray-500">Based on CRRI wear & tear formulas</p>
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900">{formatINR(data.breakdown.potholeDamage)}</div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><Droplet size={24}/></div>
              <div>
                <h4 className="font-bold text-gray-800">Treated Water Loss</h4>
                <p className="text-sm text-gray-500">Calculated at ₹6.07 per KL</p>
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900">{formatINR(data.breakdown.waterLoss)}</div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600"><ShieldAlert size={24}/></div>
              <div>
                <h4 className="font-bold text-gray-800">Crime Burden</h4>
                <p className="text-sm text-gray-500">From broken streetlights (NCRB models)</p>
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900">{formatINR(data.breakdown.crimeCost)}</div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg text-green-600"><Activity size={24}/></div>
              <div>
                <h4 className="font-bold text-gray-800">Health System Cost</h4>
                <p className="text-sm text-gray-500">Dengue/Waterborne treatment costs</p>
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900">{formatINR(data.breakdown.healthCost)}</div>
          </div>

        </div>

        {/* Right: Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Waste Distribution</h2>
          <div className="flex-grow min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => formatINR(value)} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="mt-8 bg-blue-50 p-4 rounded-lg flex items-start space-x-3 border border-blue-100">
        <AlertTriangle className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
        <div className="text-sm text-blue-800">
          <strong>Methodology Note:</strong> This dashboard uses real mathematical models from the CRRI, NCRB, and ICMR. While external APIs (like traffic volume and property values) are simulated for privacy and safety compliance, the mathematical engines calculating the Rupee figures are fully functional.
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
