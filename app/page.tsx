"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import Link from "next/link" // <--- 1. Import Link
import { Shield, Activity, FileText, Settings, Send, ChevronDown, ChevronUp, Loader2 } from "lucide-react"

type Message = {
  id: number
  type: "user" | "ai" | "threat"
  content: string
  timestamp: string
  forensicData?: {
    riskScore: number
    scanner: string
    triggers: string[]
    timestamp: string
    sourceIp?: string
  }
}

export default function AegisChat() {
  // --- STATE ---
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "ai",
      content: "Aegis Security System initialized. All systems operational.",
      timestamp: "10:24 AM", 
    }
  ])

  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [expandedForensics, setExpandedForensics] = useState<number | null>(null)
  
  // We don't need activeNav state for highlighting anymore since we are navigating pages
  // But we keep it to highlight the current page "Live Monitor"
  const activeNav = "Live Monitor" 
  
  const [currentTime, setCurrentTime] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // --- 2. UPDATED NAVIGATION ITEMS WITH LINKS ---
  const navItems = [
    { name: "Live Monitor", icon: Activity, href: "/" },
    { name: "Threat Logs", icon: FileText, href: "/logs" }, // <--- Points to your new page
    { name: "Configuration", icon: Settings, href: "#" },   // Placeholder
  ]

  // --- EFFECTS ---
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }))
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const toggleForensics = (messageId: number) => {
    setExpandedForensics(expandedForensics === messageId ? null : messageId)
  }

  // --- BACKEND INTEGRATION ---
  const handleSend = async () => {
    if (!inputValue.trim() || loading) return

    const currentInput = inputValue
    setInputValue("")
    setLoading(true)

    const newMessage: Message = {
      id: Date.now(),
      type: "user",
      content: currentInput,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, newMessage])

    try {
      const res = await axios.post("http://127.0.0.1:8000/chat", {
        message: currentInput
      })

      const data = res.data 
      const isBlocked = data.status === "blocked"

      const botMsg: Message = {
        id: Date.now() + 1,
        type: isBlocked ? "threat" : "ai",
        content: data.bot_reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        forensicData: isBlocked ? {
          riskScore: data.security_log.risk_score,
          scanner: data.security_log.scanner_name,
          triggers: data.security_log.triggers,
          timestamp: new Date().toISOString(),
          sourceIp: "127.0.0.1"
        } : undefined
      }

      setMessages((prev) => [...prev, botMsg])

    } catch (error) {
      console.error(error)
      const errorMsg: Message = {
        id: Date.now() + 1,
        type: "ai",
        content: "⚠️ System Error: Unable to reach SecureLLM Core.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col hidden md:flex">
        <div className="h-16 border-b border-sidebar-border flex items-center gap-3 px-6">
          <Shield className="w-6 h-6 text-sidebar-primary" strokeWidth={2.5} />
          <span className="font-semibold text-base tracking-tight text-sidebar-foreground">AEGIS CORE</span>
        </div>

        {/* --- 3. UPDATED NAVIGATION SECTION --- */}
        <nav className="flex-1 p-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} className="block w-full">
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeNav === item.name
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </button>
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
            <div className={`w-2 h-2 rounded-full ${loading ? "bg-yellow-500" : "bg-green-500"} animate-pulse`} />
            <span>{loading ? "Processing Request" : "All Systems Operational"}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Live Monitor</h1>
            <p className="text-xs text-muted-foreground">Real-time security conversation monitoring</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-md bg-muted text-muted-foreground font-medium min-w-[80px] text-center">
              {currentTime ? `UTC ${currentTime}` : "..."}
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => {
              if (message.type === "user") {
                return (
                  <div key={message.id} className="flex justify-end">
                    <div className="max-w-lg">
                      <div className="bg-primary text-primary-foreground rounded-lg px-4 py-3 shadow-sm">
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 text-right">{message.timestamp}</p>
                    </div>
                  </div>
                )
              }

              if (message.type === "threat") {
                return (
                  <div key={message.id} className="flex justify-start">
                    <div className="max-w-2xl w-full">
                      <div className="border-2 border-red-500/30 bg-red-950/5 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="w-5 h-5 text-red-600" strokeWidth={2.5} />
                          <span className="font-bold text-sm tracking-wide text-red-600 uppercase">
                            THREAT DETECTED
                          </span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed mb-3">{message.content}</p>

                        <button
                          onClick={() => toggleForensics(message.id)}
                          className="flex items-center gap-2 text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
                        >
                          {expandedForensics === message.id ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Hide Forensic Data
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              View Forensic Data
                            </>
                          )}
                        </button>

                        {expandedForensics === message.id && message.forensicData && (
                          <div className="mt-4 rounded-md bg-muted/50 p-4 font-mono text-xs border border-border">
                            <div className="space-y-2">
                              <div className="flex">
                                <span className="text-muted-foreground w-32">Risk Score:</span>
                                <span className="text-red-600 font-semibold">{message.forensicData.riskScore.toFixed(4)}</span>
                              </div>
                              <div className="flex">
                                <span className="text-muted-foreground w-32">Scanner:</span>
                                <span className="text-foreground">{message.forensicData.scanner}</span>
                              </div>
                              <div className="flex">
                                <span className="text-muted-foreground w-32">Triggers:</span>
                                <span className="text-foreground">
                                  [{message.forensicData.triggers.map((t) => `"${t}"`).join(", ")}]
                                </span>
                              </div>
                              <div className="flex">
                                <span className="text-muted-foreground w-32">Timestamp:</span>
                                <span className="text-foreground">{message.forensicData.timestamp}</span>
                              </div>
                              {message.forensicData.sourceIp && (
                                <div className="flex">
                                  <span className="text-muted-foreground w-32">Source IP:</span>
                                  <span className="text-foreground">{message.forensicData.sourceIp}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">{message.timestamp}</p>
                    </div>
                  </div>
                )
              }

              return (
                <div key={message.id} className="flex justify-start">
                  <div className="max-w-lg">
                    <div className="bg-card border border-border rounded-lg px-4 py-3 shadow-sm">
                      <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">{message.timestamp}</p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-border bg-card p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={loading ? "Analyzing secure channel..." : "Enter security query or command..."}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={loading || !inputValue.trim()}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}