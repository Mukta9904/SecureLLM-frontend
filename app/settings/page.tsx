"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { SlidersHorizontal, CheckCircle2, Loader2, Database } from "lucide-react"

// Define the folders you have in your backend root directory
const AVAILABLE_MODELS = [
  { id: "LR_models", name: "Logistic Regression (Context-Aware Baseline)" },
  { id: "RF_models", name: "Random Forest (High Recall Tree)" },
  // Add more here if you train XGBoost! e.g., { id: "XGB_models", name: "XGBoost Classifier" }
]

export default function SettingsPage() {
  const [threshold, setThreshold] = useState<number>(0.45)
  const [modelFolder, setModelFolder] = useState<string>("new_models")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState("")

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/admin/settings/config")
        setThreshold(res.data.threshold)
        setModelFolder(res.data.model_folder || "new_models")
      } catch (e) {
        console.error("Failed to load settings.")
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSavedMessage("")
    try {
      await axios.post("http://127.0.0.1:8000/admin/settings/config", { 
        threshold: threshold,
        model_folder: modelFolder 
      })
      setSavedMessage("Configuration & Model hot-reloaded successfully.")
      setTimeout(() => setSavedMessage(""), 3000)
    } catch (error) {
      setSavedMessage("Error updating configuration.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 border-b border-border bg-card flex items-center px-8 shrink-0">
        <div>
          <h1 className="text-lg font-semibold">Firewall Configuration</h1>
          <p className="text-xs text-muted-foreground">Adjust global security parameters and ML models</p>
        </div>
      </header>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl bg-card border border-border rounded-xl shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">MLOps Control Panel</h2>
          </div>
          
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin"/> Loading config...</div>
          ) : (
            <div className="space-y-8">
              
              {/* --- NEW MODEL SELECTOR --- */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  <label className="text-sm font-medium">Active Security Model</label>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Select the ML architecture currently powering the Aegis firewall. Changes apply instantly without server restart.
                </p>
                <select 
                  value={modelFolder}
                  onChange={(e) => setModelFolder(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {AVAILABLE_MODELS.map(model => (
                    <option key={model.id} value={model.id}>{model.name} (Folder: /{model.id})</option>
                  ))}
                </select>
              </div>

              {/* --- THRESHOLD SLIDER --- */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Risk Score Threshold</label>
                  <span className="text-lg font-bold text-primary">{threshold.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Any prompt with an ML Risk Score higher than this value will be blocked instantly. 
                </p>
                
                <input 
                  type="range" min="0.10" max="0.90" step="0.01" 
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                
                <div className="flex justify-between text-xs text-muted-foreground mt-2 font-medium">
                  <span className="text-green-600/70">Strict (0.10)</span>
                  <span>Balanced (0.45)</span>
                  <span className="text-red-600/70">Lenient (0.90)</span>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex items-center gap-4">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : "Deploy Configuration"}
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
  )
}