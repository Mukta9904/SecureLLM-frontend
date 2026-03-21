"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Shield, Activity, FileText, Settings, MessageSquare, Clock, ArrowRight } from "lucide-react"

type ChatSession = {
  session_id: string
  title: string
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/chat/sessions`)
        setSessions(res.data.sessions)
      } catch (error) {
        console.error("Failed to fetch sessions", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSessions()
  }, [])

  const handleResumeChat = (sessionId: string) => {
    // Navigate back to the Live Monitor, passing the session ID in the URL
    router.push(`/?sessionId=${sessionId}`)
  }

  return (
    <div className="flex h-screen bg-background font-sans text-foreground">
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-card flex items-center px-8">
          <div>
            <h1 className="text-lg font-semibold">Session Archive</h1>
            <p className="text-xs text-muted-foreground">Review and resume previous security monitoring sessions</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <span className="animate-pulse">Loading archive...</span>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-xl">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No recorded sessions found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.map((session) => (
                  <div 
                    key={session.session_id} 
                    className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col group cursor-pointer"
                    onClick={() => handleResumeChat(session.session_id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                        {session.session_id.substring(0, 8)}
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-sm mb-2 line-clamp-2 flex-1">
                      {session.title}
                    </h3>
                    
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Archived
                      </div>
                      <div className="text-primary font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Resume <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}