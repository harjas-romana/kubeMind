// App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Activity, Server, Shield, Zap, Terminal, Mic, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Auto-detect WebSocket protocol based on API URL
const API_URL = import.meta.env.VITE_API_URL;
const WS_URL = API_URL.replace(/^http/, 'ws'); // http -> ws, https -> wss

function App() {
  const [cpuLoad, setCpuLoad] = useState(0);
  const [podCount, setPodCount] = useState(1);
  const [logs, setLogs] = useState(["[System] KubeMind Dashboard initialized."]);
  const [isTalking, setIsTalking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  // Ref to prevent double-connections in React StrictMode
  const ws = useRef(null);

  // --- WEBSOCKET CONNECTION (The Level 1 Upgrade) ---
  useEffect(() => {
    // 1. Connect to the Cloud Hub
    ws.current = new WebSocket(`${WS_URL}/ws/stats`);

    ws.current.onopen = () => {
      setIsConnected(true);
      addLog("[Network] ✅ Connected to Telemetry Stream");
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      addLog("[Network] ❌ Connection Lost");
    };

    ws.current.onmessage = (event) => {
      try {
        // 2. Parse the Real Data from your Agent
        const data = JSON.parse(event.data);
        
        // 3. Update the UI instantly
        if (data.cpu) {
            setCpuLoad(Math.round(data.cpu));
            
            // Simple Client-Side Scaling Logic for Visualization
            // (In Level 2, we move this logic to the Backend AI)
            if (data.cpu > 80) setPodCount(prev => Math.min(prev + 1, 10));
            if (data.cpu < 30) setPodCount(prev => Math.max(prev - 1, 1));
        }
      } catch (e) {
        console.error("Parse error", e);
      }
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  const addLog = (msg) => {
    setLogs(prev => [...prev.slice(-4), msg]); 
  };

  const playVoice = async (text) => {
    setIsTalking(true);
    try {
      addLog(`[Voice] Generating audio: "${text}"`);
      const response = await fetch(`${API_URL}/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const blob = await response.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      audio.play();
      audio.onended = () => setIsTalking(false);
    } catch (e) {
      console.error("Voice failed", e);
      setIsTalking(false);
    }
  };

  const handleTrafficSpike = async () => {
    // Manual override still works for demos
    setCpuLoad(95);
    addLog("[Alert] 🚨 Manual DDoS Simulation Triggered!");
    
    // Call AI
    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpu: 95, current_pods: podCount })
      });
      const decision = await res.json();
      
      addLog(`[Decision] AI Recommends: ${decision.replicas} replicas.`);
      await playVoice(`Critical load. ${decision.reason}. Scaling to ${decision.replicas}.`);
      setPodCount(decision.replicas);
    } catch (e) {
        addLog("[Error] AI Brain unreachable.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-mono selection:bg-cyan-500 selection:text-black">
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-12 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500 rounded flex items-center justify-center">
            <Zap className="text-black fill-current" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">KubeMind <span className="text-slate-500 font-normal">v2.0 (Live)</span></h1>
        </div>
        
        {/* Connection Status Indicator */}
        <div className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full ${isConnected ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
          <Wifi size={14} className={isConnected ? "" : "animate-pulse"} />
          {isConnected ? "Agent Connected" : "Searching for Agent..."}
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h2 className="text-sm text-slate-400 uppercase tracking-wider mb-4 font-bold">Chaos Control</h2>
            <button 
              onClick={handleTrafficSpike}
              className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 p-4 rounded-lg flex items-center justify-center gap-3 transition-all active:scale-95 group"
            >
              <Shield className="group-hover:animate-pulse" />
              Force AI Intervention
            </button>
            <p className="text-xs text-slate-500 mt-3 text-center">
              (Live data overrides this after 1s)
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden">
             {isTalking && <div className="absolute top-2 right-2 text-cyan-400 animate-pulse"><Mic size={16}/></div>}
             <h2 className="text-sm text-slate-400 uppercase tracking-wider mb-4 font-bold">System Logs</h2>
             <div className="font-mono text-xs space-y-2 h-48 overflow-y-auto scrollbar-hide">
                <AnimatePresence>
                  {logs.map((log, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border-l-2 border-slate-700 pl-2 py-1 text-slate-300"
                    >
                      {log}
                    </motion.div>
                  ))}
                </AnimatePresence>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
          
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="text-center p-6 bg-slate-950/50 rounded-lg">
              <div className="text-slate-400 mb-2 flex justify-center gap-2"><Activity /> Live CPU (MacBook)</div>
              <div className={`text-5xl font-bold transition-colors duration-300 ${cpuLoad > 80 ? 'text-red-500' : 'text-white'}`}>
                {cpuLoad}%
              </div>
            </div>
            <div className="text-center p-6 bg-slate-950/50 rounded-lg">
              <div className="text-slate-400 mb-2 flex justify-center gap-2"><Server /> Active Replicas</div>
              <div className="text-5xl font-bold text-cyan-400">{podCount}</div>
            </div>
          </div>

          <div className="bg-slate-950/50 p-6 rounded-lg min-h-[200px]">
            <h3 className="text-sm text-slate-500 mb-4">Cluster Topology</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              <AnimatePresence>
                {[...Array(podCount)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="w-16 h-16 bg-cyan-900/30 border border-cyan-500/30 rounded-lg flex items-center justify-center relative group"
                  >
                    <div className="absolute inset-0 bg-cyan-400/10 blur-xl group-hover:bg-cyan-400/20 transition-all" />
                    <Server className="text-cyan-400 w-8 h-8 relative z-10" />
                    <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}

export default App