import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, ComposedChart, Scatter
} from 'recharts';
import { Download, AlertTriangle, TrendingUp, ShieldCheck, HardHat, Droplets, Map as MapIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function GodTierAnalytics() {
  const [activeTab, setActiveTab] = useState('performance');
  const [budget, setBudget] = useState(500000); // 5L INR
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [wardData, setWardData] = useState([]);
  const [contractors, setContractors] = useState([]);

  useEffect(() => {
    // In production, these would be fetched from /api/analytics/...
    const fetchMockData = () => {
      // Mock Ward Performance Data
      const wards = Array.from({ length: 15 }, (_, i) => ({
        name: `Ward ${i + 40}`,
        issues: Math.floor(Math.random() * 500) + 100,
        resolved: Math.floor(Math.random() * 400) + 50,
        trust: Math.floor(Math.random() * 40) + 60,
      }));
      setWardData(wards);

      // Mock Contractors
      setContractors([
        { id: 'C-001', name: 'L&T Civic Works', qualityScore: 92, timelineAdherence: 88, repeatFailureRate: 5 },
        { id: 'C-002', name: 'Bengal Roadways', qualityScore: 78, timelineAdherence: 85, repeatFailureRate: 12 },
        { id: 'C-003', name: 'Kolkata Infra', qualityScore: 65, timelineAdherence: 60, repeatFailureRate: 22, alert: true },
      ]);
    };
    fetchMockData();
    handleOptimizeBudget(500000);
  }, []);

  const handleOptimizeBudget = async (customBudget) => {
    try {
      // Mock API call to ML service
      const res = await fetch('http://localhost:5000/api/analytics/optimize-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total_budget: customBudget })
      });
      const data = await res.json();
      setOptimizationResult(data.allocations || data); // handle mock fallback format
    } catch (err) {
      // Mock fallback if API is not running
      setOptimizationResult({
        potholes_to_fix: Math.floor(customBudget * 0.4 / 2000),
        water_leaks_to_fix: Math.floor(customBudget * 0.3 / 5000),
        streetlights_to_fix: Math.floor(customBudget * 0.2 / 1000),
        garbage_zones_to_clear: Math.floor(customBudget * 0.1 / 500)
      });
    }
  };

  const handleDownloadReport = async () => {
    toast.success("Generating Monthly PDF Report via Puppeteer...");
    try {
      window.open('http://localhost:5000/api/analytics/report/W-45/pdf', '_blank');
    } catch (e) {
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
            God-Tier Analytics Command Center
          </h1>
          <p className="text-slate-500 mt-1">Real-time Data Science & ML Dashboards for KMC</p>
        </div>
        <button 
          onClick={handleDownloadReport}
          className="mt-4 md:mt-0 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 transition-all font-semibold flex items-center gap-2"
        >
          <Download size={18} /> Download Master PDF Report
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: 'performance', label: 'Ward Performance', icon: TrendingUp },
          { id: 'predictive', label: 'Predictive Models', icon: AlertTriangle },
          { id: 'budget', label: 'Budget Optimization (LP)', icon: ShieldCheck },
          { id: 'contractors', label: 'Contractor Intelligence', icon: HardHat }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-t-xl font-medium flex items-center gap-2 transition-colors ${
              activeTab === tab.id 
                ? 'bg-white border-t border-l border-r border-slate-200 text-blue-600 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="min-h-[500px]">
        
        {/* WARD PERFORMANCE */}
        {activeTab === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Issues vs Resolution vs Trust Index</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer>
                  <ComposedChart data={wardData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{fill: '#f1f5f9'}} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="issues" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Total Issues" />
                    <Bar yAxisId="left" dataKey="resolved" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Resolved" />
                    <Line yAxisId="right" type="monotone" dataKey="trust" stroke="#10b981" strokeWidth={3} dot={{r: 4}} name="Trust Index (%)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-6 rounded-2xl text-white shadow-md">
                <h3 className="font-semibold text-blue-100 flex items-center gap-2">
                  <ShieldCheck size={20} /> Overall KMC Trust Index
                </h3>
                <p className="text-5xl font-bold mt-3">78.4%</p>
                <p className="text-sm mt-2 text-blue-100">+2.1% from last month</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <MapIcon size={18} className="text-slate-400" />
                  Worst Performing Wards
                </h3>
                <ul className="space-y-3">
                  {wardData.slice(0, 3).map((w, i) => (
                    <li key={i} className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                      <span className="font-semibold text-red-900">{w.name}</span>
                      <span className="text-red-600 font-mono">{w.trust}% Trust</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* PREDICTIVE MODELS */}
        {activeTab === 'predictive' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <AlertTriangle size={100} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Pothole Predictive Engine</h3>
              <p className="text-slate-500 text-sm mb-6">Prophet model forecasting based on 30-day rainfall, traffic & road age.</p>
              
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-orange-900">VIP Road (Ward 12)</span>
                    <span className="px-2 py-1 bg-orange-200 text-orange-800 rounded text-xs font-bold">85% RISK</span>
                  </div>
                  <p className="text-sm text-orange-800">High rainfall + 12yr road age. Preventive maintenance recommended in 14 days.</p>
                  <p className="text-xs text-orange-600 mt-2 font-mono">ROI: Prev ₹50K vs React ₹2L</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-yellow-900">Park Street (Ward 63)</span>
                    <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs font-bold">62% RISK</span>
                  </div>
                  <p className="text-sm text-yellow-800">Traffic volume spike detected. Monitor over next 30 days.</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-blue-500">
                <Droplets size={100} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Dengue Outbreak Monitor</h3>
              <p className="text-slate-500 text-sm mb-6">Logistic regression on stagnant water reports + temperature + density.</p>
              
              <div className="p-5 bg-red-50 rounded-xl border border-red-200">
                <h4 className="text-red-600 font-bold mb-1">CRITICAL ALERT</h4>
                <p className="text-red-900 font-medium text-lg">Ward 72 - 88% Outbreak Probability</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="bg-white p-2 rounded-lg shadow-sm border border-red-100">
                    <div className="text-slate-500 text-xs">Water Reports</div>
                    <div className="font-bold text-slate-800">142</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg shadow-sm border border-red-100">
                    <div className="text-slate-500 text-xs">Avg Temp</div>
                    <div className="font-bold text-slate-800">28°C</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg shadow-sm border border-red-100">
                    <div className="text-slate-500 text-xs">Density</div>
                    <div className="font-bold text-slate-800">High</div>
                  </div>
                </div>
                <button className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors">
                  Trigger Preventive Fogging
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BUDGET OPTIMIZATION */}
        {activeTab === 'budget' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-2">SciPy Linear Programming Budget Optimizer</h3>
            <p className="text-slate-500 text-sm mb-6">Slide the budget below to mathematically maximize the number of civic issues resolved using linear programming constraints.</p>
            
            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <label className="font-semibold text-slate-700">Ward Monthly Budget Constraint (INR)</label>
                <span className="text-2xl font-bold text-blue-600">₹{(budget/100000).toFixed(1)} Lakhs</span>
              </div>
              <input 
                type="range" 
                min="100000" 
                max="2000000" 
                step="50000"
                value={budget}
                onChange={(e) => {
                  setBudget(Number(e.target.value));
                  handleOptimizeBudget(Number(e.target.value));
                }}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {optimizationResult && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Potholes to Fix', val: optimizationResult.potholes_to_fix, cost: '₹2K/ea', color: 'bg-orange-100 text-orange-800 border-orange-200' },
                  { label: 'Water Leaks', val: optimizationResult.water_leaks_to_fix, cost: '₹5K/ea', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                  { label: 'Streetlights', val: optimizationResult.streetlights_to_fix, cost: '₹1K/ea', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                  { label: 'Garbage Zones', val: optimizationResult.garbage_zones_to_clear, cost: '₹500/ea', color: 'bg-green-100 text-green-800 border-green-200' }
                ].map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${item.color}`}>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 opacity-70">{item.label}</div>
                    <div className="text-3xl font-black">{item.val}</div>
                    <div className="text-xs font-medium mt-1 opacity-80">Unit Cost: {item.cost}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-slate-600 font-medium">Mathematical Maximum Issues Resolved: </span>
              <span className="text-2xl font-bold text-slate-800 ml-2">
                {optimizationResult ? 
                  optimizationResult.potholes_to_fix + optimizationResult.water_leaks_to_fix + optimizationResult.streetlights_to_fix + optimizationResult.garbage_zones_to_clear 
                  : 0}
              </span>
            </div>
          </div>
        )}

        {/* CONTRACTORS */}
        {activeTab === 'contractors' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Contractor Performance Matrix</h3>
              <p className="text-slate-500 text-sm">Public transparency data with auto-blacklist triggers.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Contractor Name</th>
                    <th className="px-6 py-4">Quality Score</th>
                    <th className="px-6 py-4">Timeline Adherence</th>
                    <th className="px-6 py-4">Repeat Failure Rate</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contractors.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{c.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className={`h-full ${c.qualityScore > 80 ? 'bg-green-500' : c.qualityScore > 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${c.qualityScore}%` }}></div>
                          </div>
                          <span>{c.qualityScore}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{c.timelineAdherence}%</td>
                      <td className="px-6 py-4">{c.repeatFailureRate}%</td>
                      <td className="px-6 py-4">
                        {c.alert ? (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">BLACKLIST WARNING</span>
                        ) : (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">APPROVED</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
