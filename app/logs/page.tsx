
"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { 
  Shield, Activity, FileText, Settings, AlertTriangle, 
  CheckCircle, Clock, Search, RefreshCw 
} from "lucide-react"
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts'
import Link from "next/link"

// --- TYPES ---
type LogEntry = {
  _id: string
  user_input: string
  is_safe: boolean
  risk_score: number
  triggers: string[]
  timestamp: string
}

type Stats = {
  total_requests: number
  blocked_count: number
  safe_count: number
  injection_rate: string // Backend now sends string like "43.3%"
  top_patterns: { trigger: string, count: number }[] // New from MongoDB
  recent_logs: LogEntry[]
}



export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState("Threat Logs")

  // --- FETCH DATA ---
  const fetchStats = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/admin/stats")
      setStats(res.data)
    } catch (error) {
      console.error("Failed to fetch stats", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    // Auto-refresh every 5 seconds for "Live" feel
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])
  
  // Find the max count to dynamically size the red progress bars
  const maxPatternCount = stats?.top_patterns?.length 
    ? Math.max(...stats.top_patterns.map(p => p.count)) 
    : 1;
  // --- DUMMY CHART DATA (Since backend aggregation takes time to build) ---
  // In a real app, you'd fetch this. For demo, we simulate a "Live Traffic" curve.
  const chartData = [
    { time: '10:00', safe: 12, threats: 0 },
    { time: '10:05', safe: 18, threats: 1 },
    { time: '10:10', safe: 15, threats: 0 },
    { time: '10:15', safe: 25, threats: 2 },
    { time: '10:20', safe: 20, threats: 0 },
    { time: '10:25', safe: 32, threats: 1 },
    { time: '10:30', safe: 28, threats: 0 },
  ]

  return (
    <div className="flex h-screen bg-background font-sans text-foreground">
      
      {/* --- MAIN DASHBOARD CONTENT --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8">
          <div>
            <h1 className="text-lg font-semibold">Security Analytics</h1>
            <p className="text-xs text-muted-foreground">Aggregated threat intelligence metrics</p>
          </div>
          <button 
            onClick={fetchStats}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-muted hover:bg-muted/80 rounded-md transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* 1. STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Requests */}
            <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Total Requests</h3>
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{stats?.total_requests || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">+12% from last hour</p>
            </div>

            {/* Threats Blocked Card */}
            <div className="p-6 rounded-xl border border-border bg-card shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/10 rounded-bl-full -mr-4 -mt-4" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-red-600/80">Threats Blocked</h3>
                <Shield className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-2xl font-bold text-red-600">{stats?.blocked_count || 0}</div>
              <p className="text-xs text-red-600/60 mt-1 font-medium">
                {stats?.injection_rate || "0%"} Injection Rate {/* REAL INJECTION RATE */}
              </p>
            </div>

            {/* System Health */}
            <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">System Health</h3>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-600">98.9%</div>
              <p className="text-xs text-muted-foreground mt-1">Operational • Latency 45ms</p>
            </div>
          </div>

          {/* 2. CHARTS & GRAPHS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Chart */}
            <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card shadow-sm">
              <h3 className="text-sm font-medium mb-6">Traffic Analysis (Live)</h3>
              <div className="h-62.5 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="safe" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSafe)" />
                    <Area type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} fill="transparent" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Attack Vector List */}
            <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
              <h3 className="text-sm font-medium mb-4">Top Attack Patterns</h3>
              <div className="space-y-4">
                {stats?.top_patterns && stats.top_patterns.length > 0 ? (
                  stats.top_patterns.map((item) => (
                    <div key={item.trigger}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="capitalize">{item.trigger}</span>
                        <span className="font-bold">{item.count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full" 
                          // Calculate width dynamically
                          style={{ width: `${(item.count / maxPatternCount) * 100}%` }} 
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No attack patterns detected yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* 3. RECENT LOGS TABLE */}
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-sm font-medium">Recent Interceptions</h3>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search logs..." 
                  className="pl-9 pr-4 py-2 text-xs bg-muted/50 rounded-md border-none focus:ring-1 focus:ring-primary outline-none w-64"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 font-medium">Timestamp</th>
                    <th className="px-6 py-3 font-medium">Risk Score</th>
                    <th className="px-6 py-3 font-medium">Triggers</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats?.recent_logs.map((log) => (
                    <tr key={log._id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-mono font-bold ${log.risk_score > 0.8 ? 'text-red-600' : 'text-green-600'}`}>
                          {log.risk_score.toFixed(4)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {log.triggers.length > 0 ? (
                            log.triggers.map((t, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] border border-red-200 dark:border-red-900/50">
                                {t}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {log.is_safe ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            Blocked
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!stats?.recent_logs.length && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground text-xs">
                        No logs available. Start chatting to generate data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}