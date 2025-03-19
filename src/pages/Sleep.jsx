import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import { collection, addDoc, query, where, getDocs, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FaMoon, FaBed, FaChartLine, FaSignOutAlt, FaPlus } from "react-icons/fa";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const SleepAnalysis = () => {
  const [sleepRecords, setSleepRecords] = useState([]);
  const [hoursSlept, setHoursSlept] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const userEmail = auth.currentUser?.email || "";

  // Dummy data for initial render
  const dummyData = [
    { date: "2025-03-09", hoursSlept: 7.5, sleepQuality: 4, notes: "Slept well, no interruptions" },
    { date: "2025-03-10", hoursSlept: 6, sleepQuality: 2, notes: "Woke up several times" },
    { date: "2025-03-11", hoursSlept: 8, sleepQuality: 5, notes: "Best sleep in weeks" },
    { date: "2025-03-12", hoursSlept: 7, sleepQuality: 3, notes: "Average sleep" },
    { date: "2025-03-13", hoursSlept: 5.5, sleepQuality: 2, notes: "Bad dreams" },
    { date: "2025-03-14", hoursSlept: 9, sleepQuality: 5, notes: "Caught up on sleep" },
    { date: "2025-03-15", hoursSlept: 7, sleepQuality: 4, notes: "Slept deeply" }
  ];

  // Fetch user's sleep records from Firestore
  const fetchSleepRecords = async () => {
    if (!userEmail) {
      // Use dummy data for demo purposes
      setSleepRecords(dummyData);
      return;
    }
    
    try {
      const q = query(
        collection(db, "sleep"), // Changed from "sleepRecords" to "sleep"
        where("email", "==", userEmail),
        orderBy("date", "asc")
      );
      const querySnapshot = await getDocs(q);
      const records = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (records.length > 0) {
        setSleepRecords(records);
      } else {
        // Use dummy data if no user records
        setSleepRecords(dummyData);
      }
    } catch (error) {
      console.error("Error fetching sleep records:", error);
      setSleepRecords(dummyData);
    }
  };

  useEffect(() => {
    fetchSleepRecords();
  }, []);

  // Add new sleep record
  const handleAddSleepRecord = async () => {
    if (!date) return;
    setIsSubmitting(true);
    
    const newRecord = {
      email: userEmail,
      date,
      hoursSlept: parseFloat(hoursSlept),
      sleepQuality: parseInt(sleepQuality),
      notes,
      timestamp: new Date()
    };
    
    try {
      if (userEmail) {
        // Store the new record in the "sleep" collection
        await addDoc(collection(db, "sleep"), newRecord);
        console.log("Sleep record added to Firestore");
      }
      
      // Update local state with new record
      setSleepRecords([...sleepRecords, newRecord].sort((a, b) => new Date(a.date) - new Date(b.date)));
      
      // Reset form
      setDate(new Date().toISOString().split('T')[0]);
      setHoursSlept(7);
      setSleepQuality(3);
      setNotes("");
      setShowModal(false);
    } catch (error) {
      console.error("Error saving sleep record:", error);
      alert("Failed to save sleep record. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Calculate averages for stats
  const calculateStats = () => {
    if (sleepRecords.length === 0) return { avgHours: 0, avgQuality: 0, bestDay: '', worstDay: '' };
    
    const avgHours = sleepRecords.reduce((sum, record) => sum + record.hoursSlept, 0) / sleepRecords.length;
    const avgQuality = sleepRecords.reduce((sum, record) => sum + record.sleepQuality, 0) / sleepRecords.length;
    
    const bestSleepRecord = [...sleepRecords].sort((a, b) => b.sleepQuality - a.sleepQuality)[0];
    const worstSleepRecord = [...sleepRecords].sort((a, b) => a.sleepQuality - b.sleepQuality)[0];
    
    return {
      avgHours: avgHours.toFixed(1),
      avgQuality: avgQuality.toFixed(1),
      bestDay: bestSleepRecord ? formatDate(bestSleepRecord.date) : '',
      worstDay: worstSleepRecord ? formatDate(worstSleepRecord.date) : ''
    };
  };

  const stats = calculateStats();

  // Prepare data for charts
  const chartData = sleepRecords.map(record => ({
    ...record,
    date: formatDate(record.date)
  }));

  // Quality label mapper
  const getQualityLabel = (value) => {
    const labels = ["Very Poor", "Poor", "Average", "Good", "Excellent"];
    return labels[value - 1] || "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0526] via-[#1a0f33] to-[#2e124d] text-gray-100">
      {/* Background stars effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://api.placeholder/1920/1080')] bg-cover opacity-20"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navbar with glass effect */}
        <nav className="sticky top-0 backdrop-blur-md bg-purple-900/20 border-b border-purple-500/30 p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center">
            <FaMoon className="text-purple-300 mr-2 text-xl" />
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent tracking-widest">NYXORA</div>
          </div>
          <div className="flex space-x-6 items-center">
            <a href="/home" className="flex items-center text-gray-300 hover:text-purple-300 transition group">
              <FaBed className="mr-2 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">Dream Journal</span>
            </a>
            <a href="/sleep-analysis" className="flex items-center text-purple-300 transition group">
              <FaChartLine className="mr-2" />
              <span className="hidden md:inline">Sleep Analysis</span>
            </a>
            <button 
              onClick={() => navigate("/")} 
              className="flex items-center text-gray-300 hover:text-red-400 transition group"
            >
              <FaSignOutAlt className="mr-2 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-grow flex flex-col items-center px-4 py-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent mb-8">Sleep Analysis</h2>

          {/* Stats Cards */}
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-xl p-4 backdrop-blur-md border border-purple-500/30 shadow-lg">
              <div className="text-sm text-blue-300">Average Sleep</div>
              <div className="text-2xl font-bold text-white">{stats.avgHours} hrs</div>
            </div>
            <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-xl p-4 backdrop-blur-md border border-purple-500/30 shadow-lg">
              <div className="text-sm text-blue-300">Average Quality</div>
              <div className="text-2xl font-bold text-white">{stats.avgQuality}/5</div>
            </div>
            <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-xl p-4 backdrop-blur-md border border-purple-500/30 shadow-lg">
              <div className="text-sm text-blue-300">Best Sleep</div>
              <div className="text-2xl font-bold text-white">{stats.bestDay}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-xl p-4 backdrop-blur-md border border-purple-500/30 shadow-lg">
              <div className="text-sm text-blue-300">Worst Sleep</div>
              <div className="text-2xl font-bold text-white">{stats.worstDay}</div>
            </div>
          </div>

          {/* Charts */}
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Hours Slept Chart */}
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl p-6 backdrop-blur-md border border-blue-500/30 shadow-lg">
              <h3 className="text-xl font-bold text-blue-300 mb-4">Hours Slept</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.3} />
                    <XAxis dataKey="date" stroke="#a5b4fc" />
                    <YAxis stroke="#a5b4fc" domain={[0, 12]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderColor: '#8b5cf6', borderRadius: '0.5rem' }}
                      labelStyle={{ color: '#a5b4fc' }}
                    />
                    <Area type="monotone" dataKey="hoursSlept" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorHours)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sleep Quality Chart */}
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl p-6 backdrop-blur-md border border-blue-500/30 shadow-lg">
              <h3 className="text-xl font-bold text-blue-300 mb-4">Sleep Quality</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.3} />
                    <XAxis dataKey="date" stroke="#a5b4fc" />
                    <YAxis stroke="#a5b4fc" domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderColor: '#3b82f6', borderRadius: '0.5rem' }}
                      labelStyle={{ color: '#a5b4fc' }}
                      formatter={(value) => [`${value} - ${getQualityLabel(value)}`, 'Quality']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sleepQuality" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 2, fill: '#1e3a8a' }}
                      activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Sleep Records Table */}
          <div className="w-full max-w-6xl mb-6">
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl p-6 backdrop-blur-md border border-blue-500/30 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-blue-300">Recent Sleep Records</h3>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg px-4 py-2 text-white shadow-lg hover:shadow-purple-500/50 transition"
                >
                <FaPlus className="mr-2" />
                Add Record
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blue-800/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-blue-300">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-blue-300">Hours</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-blue-300">Quality</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-blue-300">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {sleepRecords.slice().reverse().slice(0, 5).map((record, index) => (
                    <tr key={record.id || index} className="border-b border-blue-800/30 hover:bg-purple-900/20">
                      <td className="px-4 py-3 text-sm text-gray-200">{formatDate(record.date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-200">{record.hoursSlept} hrs</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          <div 
                            className={`w-3 h-3 rounded-full mr-2 ${
                              record.sleepQuality >= 4 ? "bg-green-500" : 
                              record.sleepQuality === 3 ? "bg-yellow-500" : "bg-red-500"
                            }`}
                          ></div>
                          <span className="text-gray-200">{record.sleepQuality}/5</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{record.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Weekly Overview */}
        <div className="w-full max-w-6xl mb-8">
          <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl p-6 backdrop-blur-md border border-blue-500/30 shadow-lg">
            <h3 className="text-xl font-bold text-blue-300 mb-4">Weekly Sleep Pattern</h3>
            <div className="grid grid-cols-7 gap-2">
              {sleepRecords.slice(-7).map((record, index) => {
                const qualityColor = 
                  record.sleepQuality >= 4 ? "from-green-500/70 to-green-700/70" :
                  record.sleepQuality === 3 ? "from-yellow-500/70 to-yellow-700/70" : 
                  "from-red-500/70 to-red-700/70";
                  
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className="text-xs text-gray-400 mb-1">{formatDate(record.date)}</div>
                    <div 
                      className={`w-full bg-gradient-to-b ${qualityColor} rounded-lg relative shadow-lg`}
                      style={{ height: `${record.hoursSlept * 8}px` }}
                    >
                      <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-white font-bold py-1">
                        {record.hoursSlept}h
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sleep Record Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-900/80 to-blue-900/80 rounded-xl p-6 border border-purple-500/50 shadow-xl w-full max-w-md animate-fadeIn">
            <h3 className="text-2xl font-bold text-purple-200 mb-6">Record Your Sleep</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-blue-950/70 border border-blue-700/70 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">Hours Slept: {hoursSlept}</label>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={hoursSlept}
                  onChange={(e) => setHoursSlept(e.target.value)}
                  className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0h</span>
                  <span>6h</span>
                  <span>12h</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">Sleep Quality: {getQualityLabel(sleepQuality)}</label>
                <div className="flex justify-between items-center">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={sleepQuality}
                    onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                    className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Poor</span>
                  <span>Average</span>
                  <span>Excellent</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did you sleep? Any dreams?"
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg bg-blue-950/70 border border-blue-700/70 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 bg-gray-700/80 hover:bg-gray-600 rounded-lg text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSleepRecord}
                disabled={isSubmitting}
                className={`px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg text-white shadow-lg transition ${isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-purple-500/50'}`}
              >
                {isSubmitting ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer with aurora effect */}
      <footer className="relative p-6 text-center">
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 blur-xl"></div>
        <div className="relative z-10">
          <div className="text-purple-300 font-medium mb-1">Nyxora</div>
          <div className="text-gray-400 text-sm">Explore your dream consciousness © 2025</div>
        </div>
      </footer>
    </div>
  </div>
);
};

export default SleepAnalysis;