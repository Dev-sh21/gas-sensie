import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Droplets, 
  AlertTriangle, 
  Settings, 
  Bell, 
  Battery, 
  Power, 
  RefreshCcw,
  Volume2,
  VolumeX,
  Cpu,
  ChevronRight,
  TrendingUp,
  X,
  Clock,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, XAxis, CartesianGrid } from 'recharts';
import { useGasSimulation } from './hooks/useGasSimulation';

function App() {
  const {
    weight,
    ppm,
    resetPpm,
    flameLevel,
    setFlameLevel,
    isBurnerOn,
    isLeaking,
    setIsLeaking,
    valveOpen,
    toggleValve,
    gasPercentage,
    notifications,
    removeNotification,
    history,
    refill,
    estimateDays,
    isLearning,
    addNotification
  } = useGasSimulation();

  const [isMuted, setIsMuted] = useState(false);
  const [isArmed, setIsArmed] = useState(false);
  const audioRef = useRef(null);
  const [knobRotation, setKnobRotation] = useState(0);

  // High-intensity alarm sound
  useEffect(() => {
    if (ppm > 400 && !isMuted && isArmed) {
      if (audioRef.current) {
        audioRef.current.volume = 1.0;
        audioRef.current.play().catch(e => console.log("Audio play blocked"));
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [ppm, isMuted, isArmed]);

  const handleArmSystem = () => {
    setIsArmed(true);
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        audioRef.current.pause();
      }).catch(e => console.log("Init audio failed"));
    }
    addNotification("Siren System Armed", "info");
  };

  const handleNotificationClick = (notif) => {
    if (notif.message.includes("LOW GAS") || notif.message.includes("Refill")) {
      window.open("https://www.hindustanpetroleum.com/pages/hp-gas-refill-booking-options", "_blank");
    }
  };

  const handleKnobChange = (e) => {
    if (!valveOpen) {
      addNotification("Open regulator valve to use burner", "info");
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const normalizedAngle = (angle + 450) % 360; // 0 is top
    
    if (normalizedAngle <= 270) {
      const level = Math.round((normalizedAngle / 270) * 100);
      setFlameLevel(level);
      setKnobRotation(normalizedAngle);
    }
  };

  const turnOffBurner = () => {
    setFlameLevel(0);
    setKnobRotation(0);
    addNotification("Burner Turn Off Manually", "info");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 lg:p-8 flex flex-col lg:flex-row gap-8 items-start justify-center font-sans overflow-x-hidden">
      
      {/* Audio Element for Alarm */}
      <audio ref={audioRef} src="https://www.soundjay.com/buttons/beep-01a.mp3" loop />

      {/* Pop-up Notifications (Toasts) */}
      <div className="toast-container">
        <AnimatePresence>
          {notifications.filter(n => n.type === 'danger' || n.type === 'warning').slice(0, 1).map((notif) => (
            <motion.div 
              key={notif.id}
              initial={{ y: -100, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`toast ${notif.type === 'danger' ? 'toast-danger' : 'border-orange-500/50 bg-orange-500/10'}`}
            >
              <div 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white animate-pulse ${notif.type === 'danger' ? 'bg-red-500' : 'bg-orange-500'}`}
                onClick={() => handleNotificationClick(notif)}
              >
                {notif.type === 'danger' ? <AlertTriangle size={24} /> : <Droplets size={24} />}
              </div>
              <div className="flex-1 cursor-pointer" onClick={() => handleNotificationClick(notif)}>
                <h3 className={`font-black uppercase tracking-tighter ${notif.type === 'danger' ? 'text-red-500' : 'text-orange-500'}`}>
                  {notif.type === 'danger' ? 'Emergency Alert' : 'System Alert'}
                </h3>
                <p className="text-sm font-bold text-white/90 leading-tight">{notif.message}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={20} className="text-white/40" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Mobile App View (Phone Interface) */}
      <section className="w-full lg:w-[380px] shrink-0 lg:sticky lg:top-8 order-1 lg:order-1">
        <div className="relative mx-auto w-full aspect-[9/19] bg-neutral-900 rounded-[3.5rem] p-3 border-[10px] border-neutral-800 phone-shadow overflow-hidden">
          <div className="w-full h-full bg-white rounded-[2.8rem] overflow-hidden flex flex-col text-black">
            
            {/* Status Bar */}
            <div className="px-8 pt-6 pb-2 flex justify-between items-center text-black/40">
              <span className="text-[10px] font-black tracking-widest uppercase">Live Signal</span>
              <div className="flex gap-2 items-center">
                <div className={`w-2 h-2 rounded-full ${ppm > 400 ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
                <Battery size={14} className="rotate-90" />
              </div>
            </div>

            {/* App Header */}
            <header className="px-8 py-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-black text-black tracking-tighter">Gas Sensi</h1>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">System Online</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center text-black hover:bg-neutral-200 transition-colors cursor-pointer">
                  <Settings size={20} />
                </div>
              </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-12 no-scrollbar">
              
              {/* Prediction Card */}
              <div className={`p-6 rounded-[2.5rem] text-white flex items-center justify-between relative overflow-hidden group transition-all ${isLearning ? 'bg-neutral-900' : 'bg-indigo-600'}`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px]" />
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isLearning ? 'bg-white/10' : 'bg-white/20'}`}>
                    {isLearning ? <RefreshCcw size={24} className="animate-spin opacity-50" /> : <Zap size={24} className="text-yellow-300" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Prediction</h4>
                       {!isLearning && <span className="bg-white/20 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter">Adaptive</span>}
                    </div>
                    <p className="text-2xl font-black">
                       {isLearning ? 'Learning...' : `${estimateDays} Days Left`}
                    </p>
                  </div>
                </div>
                {!isLearning && <ChevronRight size={20} className="opacity-40" />}
              </div>

              {/* Main Gauge */}
              <div className="bg-neutral-50 p-8 rounded-[3rem] border border-neutral-100 flex flex-col items-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[40px]" />
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="88" cy="88" r="78" stroke="currentColor" strokeWidth="14" fill="transparent" className="text-neutral-200" />
                    <motion.circle
                      cx="88" cy="88" r="78" stroke="currentColor" strokeWidth="14" strokeLinecap="round" fill="transparent"
                      strokeDasharray="490"
                      initial={{ strokeDashoffset: 490 }}
                      animate={{ strokeDashoffset: 490 - (490 * gasPercentage) / 100 }}
                      className={gasPercentage < 20 ? 'text-red-500' : 'text-black'}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-black tracking-tighter">{Math.round(gasPercentage)}%</span>
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Remaining</span>
                  </div>
                </div>
              </div>

              {/* Usage History Chart */}
              <div className="bg-black p-6 rounded-[2.5rem] text-white space-y-4">
                 <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Real-time Usage</h4>
                    <TrendingUp size={14} className="text-red-500" />
                 </div>
                 <div className="h-24 px-1">
                   <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history}>
                        <Line type="monotone" dataKey="percentage" stroke="#ef4444" strokeWidth={3} dot={false} isAnimationActive={false} />
                      </LineChart>
                   </ResponsiveContainer>
                 </div>
              </div>

              {/* Action Card (Refill) */}
              <div 
                onClick={() => gasPercentage <= 10 && window.open("https://www.hindustanpetroleum.com/pages/hp-gas-refill-booking-options", "_blank")}
                className={`p-7 rounded-[2.5rem] relative overflow-hidden group cursor-pointer transition-all ${gasPercentage <= 10 ? 'bg-red-500 text-white animate-pulse' : 'bg-neutral-900 text-white'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Cylinder Weight</p>
                    <h3 className="text-3xl font-black">{weight.toFixed(2)}<span className="text-xs ml-1 opacity-50 font-medium">KG</span></h3>
                  </div>
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <RefreshCcw size={20} className={gasPercentage <= 10 ? 'animate-spin' : ''} />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                  <span>{gasPercentage <= 10 ? 'Order Refill Now' : 'Healthy Status'}</span>
                  <ChevronRight size={14} />
                </div>
              </div>

              {/* Activity Log */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] px-2">Activity Feed</h4>
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {notifications.slice(0, 3).map((notif) => (
                      <motion.div 
                        key={notif.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-5 rounded-3xl border flex items-start gap-4 ${
                          notif.type === 'danger' ? 'bg-red-50 border-red-100' : 
                          notif.type === 'warning' ? 'bg-orange-50 border-orange-100' : 
                          'bg-neutral-50 border-neutral-100 shadow-sm'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          notif.type === 'danger' ? 'bg-red-500 text-white' : 
                          notif.type === 'warning' ? 'bg-orange-500 text-white' : 
                          'bg-white text-neutral-400'
                        }`}>
                          <AlertTriangle size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-black leading-tight ${notif.type === 'danger' ? 'text-red-900' : notif.type === 'warning' ? 'text-orange-900' : 'text-neutral-900'}`}>
                            {notif.message}
                          </p>
                          <p className="text-[8px] font-bold text-neutral-400 mt-1 uppercase">{notif.time}</p>
                        </div>
                        <button onClick={() => removeNotification(notif.id)} className="p-1 hover:bg-black/5 rounded-lg">
                          <X size={14} className="text-neutral-300" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
          {/* Phone Speaker/Notch */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-20 h-5 bg-neutral-800 rounded-2xl z-20" />
        </div>
      </section>

      {/* Simulation Workbench */}
      <section className="flex-1 w-full max-w-4xl space-y-6 order-2 lg:order-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
            <span className="bg-red-500 p-2.5 rounded-2xl"><Cpu className="text-white" /></span>
             Workbench
          </h1>
          <div className="flex gap-2">
            {!isArmed && (
              <button onClick={handleArmSystem} className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/50 px-6 py-3 rounded-2xl font-black hover:bg-indigo-600/30 transition-all flex items-center gap-2">
                <Power size={18} /> ARM SIREN
              </button>
            )}
            <button onClick={() => setIsMuted(!isMuted)} className="glass p-3 rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-neutral-400">
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button onClick={refill} className="bg-white text-black font-black px-6 py-3 rounded-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
              <RefreshCcw size={18} /> REFILL
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hardware Twin Panel */}
          <div className="glass p-8 rounded-[2.5rem] space-y-8 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none" />
            <h2 className="text-xs font-black text-neutral-500 uppercase tracking-[0.2em]">Hardware Digital Twin</h2>
            
            <div className="flex flex-col items-center justify-center py-10 space-y-12">
              <div className="regulator-container group/reg">
                <motion.div animate={{ rotateY: valveOpen ? 0 : 25, rotateX: 10, scale: 1.05 }} className="regulator-body cursor-pointer hover:ring-4 ring-red-500/20" onClick={toggleValve}>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-neutral-900 rounded-full border border-white/10 text-[10px] font-black text-white/80 uppercase whitespace-nowrap">Click to Toggle Valve</div>
                  <motion.div animate={{ rotate: valveOpen ? 0 : 90 }} transition={{ type: "spring", stiffness: 100 }} className="regulator-dial">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-6 bg-red-500 rounded-full" />
                  </motion.div>
                </motion.div>
                <div className="w-40 h-4 bg-neutral-900/50 blur-xl mx-auto mt-4 rounded-full" />
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-neutral-900/40 p-5 rounded-3xl border border-white/5 space-y-3">
                  <div className="flex items-center gap-3 text-white"><Cpu className="text-indigo-400" size={20} /><span className="text-xs font-bold text-neutral-400 uppercase">ESP32-C6</span></div>
                  <div className="flex gap-1.5"><div className={`h-1.5 flex-1 rounded-full transition-colors ${valveOpen ? 'bg-green-500' : 'bg-red-500'}`} /><div className={`h-1.5 flex-1 rounded-full transition-colors ${ppm > 400 ? 'bg-red-500' : 'bg-blue-500'}`} /></div>
                </div>
                <div className="bg-neutral-900/40 p-5 rounded-3xl border border-white/5 space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3"><Droplets className="text-orange-400" size={20} /><span className="text-xs font-bold text-neutral-400 uppercase">MQ-2</span></div>
                    <button onClick={resetPpm} className="text-[8px] font-black bg-white/5 hover:bg-white/10 px-2 py-1 rounded border border-white/5 uppercase">Reset</button>
                  </div>
                  <div className="text-2xl font-mono font-black text-white/90">{Math.round(ppm)}<span className="text-[10px] text-neutral-500 ml-1">PPM</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="glass p-8 rounded-[2.5rem] space-y-8 border border-white/5">
            <h2 className="text-xs font-black text-neutral-500 uppercase tracking-[0.2em]">Controls</h2>
            <div className="space-y-12">
              <div className="flex flex-col items-center gap-6">
                <div className="flex justify-between items-center w-full px-4">
                  <div className="text-left"><p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Burner Flame</p><p className="text-4xl font-black">{flameLevel}%</p></div>
                  <button 
                    onClick={turnOffBurner}
                    disabled={flameLevel === 0}
                    className={`px-6 py-3 rounded-2xl font-black text-xs transition-all ${flameLevel > 0 ? 'bg-red-500 hover:bg-red-600 active:scale-95' : 'bg-neutral-800 text-neutral-500 opacity-50'}`}
                  >
                    TURN OFF
                  </button>
                </div>
                <div className="relative">
                  <div className="knob-container" onMouseMove={(e) => e.buttons === 1 && handleKnobChange(e)} onMouseDown={handleKnobChange}>
                    <motion.div className="w-full h-full relative" style={{ rotate: knobRotation }}><div className="knob-indicator" /></motion.div>
                  </div>
                  <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-end justify-center h-20 w-20 pointer-events-none">
                    <AnimatePresence>{isBurnerOn && (<motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 0.8 + (flameLevel / 100), opacity: 1 }} exit={{ scale: 0, opacity: 0 }}><Flame size={64} className={`${flameLevel > 70 ? 'text-red-500' : 'text-orange-400'} animate-pulse`} /></motion.div>)}</AnimatePresence>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsLeaking(!isLeaking)} 
                className={`w-full p-6 rounded-3xl border transition-all flex items-center justify-between ${isLeaking ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-neutral-900/50 border-white/5 text-neutral-400 hover:border-white/10'}`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className={`p-3 rounded-2xl ${isLeaking ? 'bg-red-500 text-white' : 'bg-white/5'}`}><AlertTriangle size={24} /></div>
                  <div><p className="text-sm font-black uppercase">Leakage Simulator</p><p className="text-[8px] font-bold opacity-50 uppercase tracking-widest">Toggle Gas Escape</p></div>
                </div>
                <div className={`w-3 h-3 rounded-full ${isLeaking ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 'bg-neutral-700'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Panel */}
        <div className="glass p-8 rounded-[2.5rem] border border-white/5 h-[320px]">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-black text-neutral-500 uppercase tracking-[0.2em]">Gas Presence Analytics</h2>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase text-neutral-400">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /> MQ-2 Sensor</span>
              </div>
           </div>
           <ResponsiveContainer width="100%" height="80%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#444" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                <Line type="monotone" dataKey="percentage" stroke="#ef4444" strokeWidth={3} dot={false} strokeLinecap="round" isAnimationActive={false} />
              </LineChart>
           </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

export default App;
