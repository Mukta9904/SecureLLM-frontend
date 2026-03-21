"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import axios from "axios"
import { v4 as uuidv4 } from "uuid"
import { Shield, Activity, FileText, Settings, MessageSquare, Plus } from "lucide-react"

type ChatSession = {
  session_id: string
  title: string
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [sessionList, setSessionList] = useState<ChatSession[]>([])
  
  // We use the URL to determine the active nav item automatically!
  const navItems = [
    { name: "Live Monitor", icon: Activity, href: "/" },
    { name: "Chat History", icon: MessageSquare, href: "/history" },
    { name: "Threat Logs", icon: FileText, href: "/logs" }, 
    { name: "Configuration", icon: Settings, href: "/settings" }, 
  ]

  const fetchSessionList = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/chat/sessions`)
      setSessionList(res.data.sessions)
    } catch (e) {
      console.error("Could not fetch session list")
    }
  }

  useEffect(() => {
    fetchSessionList()
    
    // Listen for a custom event from the chat page to refresh the list automatically
    const handleRefresh = () => fetchSessionList()
    window.addEventListener("refreshSidebar", handleRefresh)
    return () => window.removeEventListener("refreshSidebar", handleRefresh)
  }, [])

  const handleNewChat = () => {
    const newId = uuidv4()
    // Go to the main page and pass the new ID
    router.push(`/?sessionId=${newId}`)
    // Optimistically add it to the top of the list
    setSessionList(prev => [{ session_id: newId, title: "New Chat..." }, ...prev])
  }

  return (
    <aside className="w-64 border-r border-border bg-sidebar flex-col hidden md:flex shrink-0 h-full">
      <div className="h-16 border-b border-sidebar-border flex items-center gap-3 px-6 shrink-0">
        <Shield className="w-6 h-6 text-sidebar-primary" strokeWidth={2.5} />
        <span className="font-semibold text-base tracking-tight text-sidebar-foreground">AEGIS CORE</span>
      </div>
      
      {/* Main Navigation */}
      <div className="p-3 shrink-0">
        <button 
          onClick={handleNewChat}
          className="w-full flex items-center gap-2 px-3 py-2.5 mb-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>

        <div className="space-y-1 mb-4 border-b border-sidebar-border pb-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href} className="block w-full">
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </button>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Chat History Section */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar">
        <h3 className="text-xs font-semibold text-sidebar-foreground/50 px-3 mb-2 uppercase tracking-wider">
          Recent Sessions
        </h3>
        <div className="space-y-1">
          {sessionList.map((session) => (
            <button
              key={session.session_id}
              onClick={() => router.push(`/?sessionId=${session.session_id}`)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left truncate text-sidebar-foreground/70 hover:bg-sidebar-accent/30"
            >
              <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
              <span className="truncate">{session.title}</span>
            </button>
          ))}
          {sessionList.length === 0 && (
            <div className="px-3 py-2 text-xs text-sidebar-foreground/50 italic">No history found.</div>
          )}
        </div>
      </div>
    </aside>
  )
}