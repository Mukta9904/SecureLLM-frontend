"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Link from "next/link"
import { Shield, Activity, FileText, Settings, SlidersHorizontal, CheckCircle2, Loader2 } from "lucide-react"

export default function SettingsPage() {
  const [threshold, setThreshold] = useState<number>(0.30)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState("")

  // Fetch the current global threshold from RAM on load
  useEffect(() => {
    const fetchThreshold = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/admin/settings/threshold")
        setThreshold(res.data.threshold)
      } catch (e) {
        console.error("Failed to load settings.")
      } finally {
        setLoading(false)
      }
    }
    fetchThreshold()
  }, [])

  // Save changes to the backend
  const handleSave = async () => {
    setSaving(true)
    setSavedMessage("")
    try {
      await axios.post("http://127.0.0.1:8000/admin/settings/threshold", { threshold })
      setSavedMessage("Security threshold updated instantly.")
      setTimeout(() => setSavedMessage(""), 3000)
    } catch (error) {
      setSavedMessage("Error updating threshold.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-screen bg-background font-sans text-foreground">

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-card flex items-center px-8">
          <div>
            <h1 className="text-lg font-semibold">Firewall Configuration</h1>
            <p className="text-xs text-muted-foreground">Adjust global security parameters</p>
          </div>
        </header>

        <div className="flex-1 p-8">
          <div className="max-w-2xl bg-card border border-border rounded-xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">ML Threshold Tuning</h2>
            </div>
            
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin"/> Loading config...</div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Risk Score Threshold</label>
                    <span className="text-lg font-bold text-primary">{threshold.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Any prompt with an ML Risk Score higher than this value will be blocked instantly. 
                    Lower values increase security but may cause false positives.
                  </p>
                  
                  {/* The Slider */}
                  <input 
                    type="range" 
                    min="0.10" 
                    max="0.90" 
                    step="0.01" 
                    value={threshold}
                    onChange={(e) => setThreshold(parseFloat(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  
                  <div className="flex justify-between text-xs text-muted-foreground mt-2 font-medium">
                    <span className="text-green-600/70">Strict (0.10)</span>
                    <span>Balanced (0.30)</span>
                    <span className="text-red-600/70">Lenient (0.90)</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex items-center gap-4">
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : "Save Global Configuration"}
                  </button>
                  {savedMessage && (
                    <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> {savedMessage}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}