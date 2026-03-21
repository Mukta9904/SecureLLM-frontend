"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import axios from "axios"
import ReactMarkdown from "react-markdown"
import { v4 as uuidv4 } from "uuid"
import { useSearchParams } from "next/navigation" // <-- NEW IMPORT
import { Shield, Send, ChevronDown, ChevronUp, Loader2 } from "lucide-react"

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

// 1. We move the actual chat logic into a sub-component
function ChatInterface() {
  const searchParams = useSearchParams() 
  const urlSessionId = searchParams.get("sessionId") // <-- LISTENS TO THE URL

  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [expandedForensics, setExpandedForensics] = useState<number | null>(null)
  const [sessionId, setSessionId] = useState<string>("") 

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // --- UPDATED SESSION LOGIC ---
  useEffect(() => {
    // 1. Prioritize URL > Session Storage > New UUID
    let currentSession = urlSessionId || sessionStorage.getItem("aegis_session_id")
    if (!currentSession) {
      currentSession = uuidv4()
    }
    
    // 2. Save it and lock it in state
    sessionStorage.setItem("aegis_session_id", currentSession)
    setSessionId(currentSession)

    // 3. Clear the screen immediately while fetching
    setMessages([])

    // 4. Fetch the history for this session
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/chat/sessions/${currentSession}`)
        if (res.data.messages && res.data.messages.length > 0) {
            const historyMessages = res.data.messages.map((msg: any, index: number) => {
                const isThreat = msg.role === "bot" && msg.is_blocked === true;
                return {
                    id: Date.now() + index,
                    type: msg.role === "user" ? "user" : (isThreat ? "threat" : "ai"), 
                    content: msg.content,
                    timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    forensicData: isThreat && msg.security_log ? {
                        riskScore: msg.security_log.risk_score,
                        scanner: msg.security_log.scanner_name,
                        triggers: msg.security_log.triggers,
                        timestamp: new Date(msg.timestamp).toLocaleTimeString(),
                        sourceIp: "127.0.0.1"
                    } : undefined
                };
            });
            setMessages(historyMessages)
        } else {
            setMessages([{
              id: 1, type: "ai", content: "Aegis Security System initialized. All systems operational.",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }])
        }
      } catch (e) {
        setMessages([{
          id: 1, type: "ai", content: "Aegis Security System initialized. All systems operational.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }])
      }
    }
    
    fetchHistory()
  }, [urlSessionId]) // <-- CRITICAL FIX: Re-run this effect EVERY TIME the URL changes!

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const toggleForensics = (messageId: number) => {
    setExpandedForensics(expandedForensics === messageId ? null : messageId)
  }

  const handleSend = async () => {
    if (!inputValue.trim() || loading) return

    const currentInput = inputValue
    setInputValue("")
    setLoading(true)

    const newMessage: Message = {
      id: Date.now(), type: "user", content: currentInput,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, newMessage])

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        message: currentInput,
        session_id: sessionId 
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
          timestamp: new Date().toLocaleTimeString(),
          sourceIp: "127.0.0.1"
        } : undefined
      }

      setMessages((prev) => [...prev, botMsg])
      window.dispatchEvent(new Event("refreshSidebar"))
      
    } catch (error) {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1, type: "threat", content: "⚠️ System Error: Unable to reach SecureLLM Core.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex-1 flex flex-col min-w-0 h-full">
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Live Monitor</h1>
          <p className="text-xs text-muted-foreground">Real-time security conversation monitoring</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-md bg-muted text-muted-foreground font-medium min-w-20 text-center">
            {sessionId.substring(0,8)}...
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 scroll-smooth">
        <div className="max-w-4xl mx-auto overflow-hidden space-y-4">
          {messages.map((message) => {
            if (message.type === "user") {
              return (
                <div key={message.id} className="flex justify-end overflow-hidden">
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
                          <><ChevronUp className="w-4 h-4" /> Hide Forensic Data</>
                        ) : (
                          <><ChevronDown className="w-4 h-4" /> View Forensic Data</>
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
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <div key={message.id} className="flex justify-start">
                <div className="max-w-2xl">
                  <div className="bg-card border border-border rounded-lg px-4 py-3 shadow-sm text-sm leading-relaxed text-foreground">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">{message.timestamp}</p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border bg-card p-4 shrink-0">
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
             <button onClick={handleSend} disabled={loading || !inputValue.trim()} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50">
               {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
               Send
             </button>
           </div>
         </div>
       </div>
    </main>
  )
}

// 2. We wrap it in a Suspense boundary so Next.js build doesn't crash when deploying
export default function AegisChat() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <ChatInterface />
    </Suspense>
  )
}