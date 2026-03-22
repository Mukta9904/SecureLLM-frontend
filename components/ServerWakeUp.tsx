"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Loader2, Server, ShieldCheck } from "lucide-react"

export default function ServerWakeUp({ children }: { children: React.ReactNode }) {
  const [isAwake, setIsAwake] = useState(false)
  const [loadingTime, setLoadingTime] = useState(0)

  useEffect(() => {
    // Timer to show the user that something is actually happening
    const timer = setInterval(() => {
      setLoadingTime((prev) => prev + 1)
    }, 1000)

    const wakeUpBackend = async () => {
      while (!isAwake) {
        try {
          // We ping a lightweight endpoint. If it returns 200 OK, the server is awake!
          await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings/config`, {
            timeout: 10000, // Wait 10 seconds before retrying
          })
          setIsAwake(true)
          clearInterval(timer)
          break // Exit the loop
        } catch (error) {
          console.log("Server still sleeping, retrying...")
          // Wait 3 seconds before pinging again to avoid spamming the network
          await new Promise((resolve) => setTimeout(resolve, 3000))
        }
      }
    }

    wakeUpBackend()

    return () => clearInterval(timer)
  }, [isAwake])

  // If the server is awake, render the actual application!
  if (isAwake) {
    return <>{children}</>
  }

  // If the server is sleeping, show this beautiful boot screen
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center max-w-md text-center">
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-blue-600 p-4 rounded-full text-white">
            <Server size={32} />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Aegis SecureLLM</h1>
        <h2 className="text-lg font-semibold text-slate-700 mb-2">Waking up cloud servers...</h2>
        
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          Because this is a free-tier deployment, the AI firewall and database go to sleep when inactive. 
          Booting the Machine Learning models into memory usually takes about <strong>50 seconds</strong>.
        </p>

        <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: `${Math.min((loadingTime / 50) * 100, 100)}%` }}></div>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <Loader2 className="animate-spin w-4 h-4" />
          <span>Elapsed Time: {loadingTime}s</span>
        </div>
      </div>
    </div>
  )
}