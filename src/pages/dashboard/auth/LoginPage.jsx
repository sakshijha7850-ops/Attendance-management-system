import { useEffect, useState } from "react";
import { api } from "../../services/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

const PIE_COLORS = ["#22c55e", "#ef4444"];

export default function Dashboard({ dark }) {
  const [todayStats, setTodayStats] = useState({ totalStudents: 0, presentToday: 0, absentToday: 0 });
  const [chartData, setChartData] = useState([]);
  const [selectedSem, setSelectedSem] = useState("1");
  const [selectedSection, setSelectedSection] = useState("A");

  useEffect(() => { fetchTodayStats(); }, []);
  useEffect(() => { fetchMonthlyData(); }, [selectedSem, selectedSection]);

  const fetchTodayStats = async () => {
    try {
      const [studentList, allAttendance] = await Promise.all([
        api.getStudents(), api.getAttendance()
      ]);
      const todayDate = new Date().toISOString().split("T")[0];
      const todayRecords = allAttendance.filter(a => a.date === todayDate);
      const uniquePresent = [...new Set(todayRecords.filter(a => a.status === "present").map(a => a.studentId?._id || a.studentId))].length;
      const uniqueAbsent = [...new Set(todayRecords.filter(a => a.status === "absent").map(a => a.studentId?._id || a.studentId))].length;
      setTodayStats({ totalStudents: studentList.length, presentToday: uniquePresent, absentToday: uniqueAbsent });
    } catch (err) {
      console.error("Stats could not be loaded:", err);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const data = await Promise.all(
        monthNames.map(async (monthName, idx) => {
          try {
            const report = await api.getMonthlyReport(selectedSem, selectedSection, idx + 1, currentYear);
            if (!Array.isArray(report)) return { month: monthName, Present: 0, Absent: 0 };
            const totalPresent = report.reduce((sum, r) => sum + (r.present || 0), 0);
            const totalAbsent = report.reduce((sum, r) => sum + (r.absent || 0), 0);
            return { month: monthName, Present: totalPresent, Absent: totalAbsent };
          } catch {
            return { month: monthName, Present: 0, Absent: 0 };
          }
        })
      );
      setChartData(data);
    } catch (err) {
      console.error("Monthly chart error:", err);
    }
  };

  const pieChartData = [
    { name: "Present", value: todayStats.presentToday },
    { name: "Absent", value: todayStats.absentToday },
  ];

  const statCards = [
    { label: "Total Students", value: todayStats.totalStudents, color: "bg-blue-500", icon: "🎓" },
    { label: "Present Today", value: todayStats.presentToday, color: "bg-green-500", icon: "✅" },
    { label: "Absent Today", value: todayStats.absentToday, color: "bg-red-500", icon: "❌" },
  ];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#0f1729", color: "white" }}>

      {/* Navbar */}
      <div className="flex items-center gap-6 mb-8 px-4 py-3 rounded-xl" style={{ backgroundColor: "#1a2332" }}>
        <span className="text-xl font-bold text-white">🎓 AMS</span>
        {["Dashboard", "My Courses", "Downloads", "Academic Calendar", "Forms"].map((item) => (
          <button key={item} className="text-sm text-gray-400 hover:text-white">{item}</button>
        ))}
      </div>

      {/* Academic Calendar Banner */}
      <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: "#1e1b4b" }}>
        <p className="text-xs text-gray-400 mb-1">📅 ACADEMIC CALENDAR <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded ml-2">1 event</span></p>
        <p className="text-sm font-semibold text-white">Notification of Attendance</p>
        <p className="text-xs text-gray-400">Mar 27 - Mar 27</p>
      </div>

      {/* Welcome */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, Student!</h1>
          <p className="text-gray-400 text-sm">Current Session: Jan-June 2026</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm text-white">Class Schedule</button>
          <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm text-white">Parent Access</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className={`${card.color} text-white rounded-xl p-6 shadow`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium opacity-90">{card.label}</p>
                <p className="text-4xl font-bold mt-1">{card.value}</p>
              </div>
              <span className="text-4xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4">

        {/* Pie Chart */}
        <div className="rounded-xl p-6" style={{ backgroundColor: "#1a2332" }}>
          <h3 className="font-bold mb-3 text-white">Today's Attendance</h3>
          {todayStats.presentToday === 0 && todayStats.absentToday === 0 ? (
            <p className="text-gray-400 text-center py-8">No attendance found.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {pieChartData.map((entry, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1a2332", border: "none", color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar Chart */}
        <div className="rounded-xl p-6 col-span-2" style={{ backgroundColor: "#1a2332" }}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-white">Monthly Attendance</h3>
            <div className="flex gap-2">
              <select value={selectedSem} onChange={(e) => setSelectedSem(e.target.value)}
                className="border px-2 py-1 rounded text-sm focus:outline-none text-white"
                style={{ backgroundColor: "#0f1729", borderColor: "#374151" }}>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
              </select>
              <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}
                className="border px-2 py-1 rounded text-sm focus:outline-none text-white"
                style={{ backgroundColor: "#0f1729", borderColor: "#374151" }}>
                {["A","B","C","D"].map(s => <option key={s} value={s}>Sec {s}</option>)}
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d40" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#1a2332", border: "none", color: "#fff" }} />
              <Legend />
              <Bar dataKey="Present" fill="#22c55e" radius={[4,4,0,0]} />
              <Bar dataKey="Absent" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}