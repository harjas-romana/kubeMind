// App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Activity, Server, Shield, Zap, Terminal, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [cpuLoad, setCpuLoad] = useState(24);
  const [podCount, setPodCount] = useState(1);
  const [logs, setLogs] = useState(["[System] KubeMind Agent initialized.", "[System] Monitoring default namespace..."]);
  const [isTalking, setIsTalking] = useState(false);
  
  // Simulation: Natural fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuLoad(prev => {
        const noise = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(10, Math.min(100, prev + noise));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (msg) => {
    setLogs(prev => [...prev.slice(-4), msg]); // Keep last 5 logs
  };

  const playVoice = async (text) => {
    setIsTalking(true);
    try {
      // In real backend, this fetches mp3 from EdgeTTS
      // For now, we simulate the "Processing" delay
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
    setCpuLoad(92);
    addLog("[Alert] 🚨 DDoS Attack Detected! CPU Spike to 92%");
    
    // 1. Call AI Agent
    addLog("[AI] Groq analyzing metrics...");
    
    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpu: 92, current_pods: podCount })
      });
      
      const decision = await res.json();
      
      // 2. Act
      addLog(`[Decision] Scaling to ${decision.replicas} replicas. Reason: ${decision.reason}`);
      await playVoice(`Critical load detected. ${decision.reason}. Scaling to ${decision.replicas} replicas.`);
      
      // 3. Update UI (The Visual Satisfaction)
      setPodCount(decision.replicas);
      setCpuLoad(45); // Load drops after scaling
      addLog("[System] Scaling complete. CPU stabilized.");
      
    } catch (e) {
      addLog("[Error] Backend unreachable. Check connection.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-mono selection:bg-cyan-500 selection:text-black">
      {/* Header */}
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-12 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500 rounded flex items-center justify-center">
            <Zap className="text-black fill-current" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">KubeMind <span className="text-slate-500 font-normal">v1.0</span></h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          System Online
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Controls */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h2 className="text-sm text-slate-400 uppercase tracking-wider mb-4 font-bold">Chaos Engineering</h2>
            <button 
              onClick={handleTrafficSpike}
              className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 p-4 rounded-lg flex items-center justify-center gap-3 transition-all active:scale-95 group"
            >
              <Shield className="group-hover:animate-pulse" />
              Simulate DDoS Attack
            </button>
            <p className="text-xs text-slate-500 mt-3 text-center">
              Injects 10k requests/sec to trigger HPA
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden">
             {isTalking && <div className="absolute top-2 right-2 text-cyan-400 animate-pulse"><Mic size={16}/></div>}
             <h2 className="text-sm text-slate-400 uppercase tracking-wider mb-4 font-bold">Agent Logs</h2>
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

        {/* Right Col: Visualization */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
          
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="text-center p-6 bg-slate-950/50 rounded-lg">
              <div className="text-slate-400 mb-2 flex justify-center gap-2"><Activity /> CPU Load</div>
              <div className={`text-5xl font-bold ${cpuLoad > 80 ? 'text-red-500' : 'text-white'}`}>
                {cpuLoad}%
              </div>
            </div>
            <div className="text-center p-6 bg-slate-950/50 rounded-lg">
              <div className="text-slate-400 mb-2 flex justify-center gap-2"><Server /> Active Pods</div>
              <div className="text-5xl font-bold text-cyan-400">{podCount}</div>
            </div>
          </div>

          {/* Pod Visualization */}
          <div className="bg-slate-950/50 p-6 rounded-lg min-h-[200px]">
            <h3 className="text-sm text-slate-500 mb-4">Cluster Topology (us-east-1)</h3>
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