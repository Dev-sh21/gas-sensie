import { useState, useEffect, useCallback } from 'react';

const FULL_WEIGHT = 14.2; 
const EMPTY_WEIGHT = 15.8; 
const TOTAL_FULL = FULL_WEIGHT + EMPTY_WEIGHT;

export function useGasSimulation() {
  const [weight, setWeight] = useState(TOTAL_FULL);
  const [ppm, setPpm] = useState(120);
  const [flameLevel, setFlameLevel] = useState(0); 
  const [isLeaking, setIsLeaking] = useState(false);
  const [valveOpen, setValveOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [hasAlertedLowGas, setHasAlertedLowGas] = useState(false);
  const [history, setHistory] = useState([]);


  const [usageIntensitySum, setUsageIntensitySum] = useState(0);
  const [totalUsageTicks, setTotalUsageTicks] = useState(0);

  const isBurnerOn = flameLevel > 0;


  useEffect(() => {
    let interval;
    if (valveOpen && (isBurnerOn || isLeaking)) {
      interval = setInterval(() => {
        setWeight((prev) => {
          const burnerConsumption = (flameLevel / 100) * 0.05; 
          const leakageConsumption = 0.08; 
          const consumption = isLeaking ? leakageConsumption : burnerConsumption;
          const nextWeight = Math.max(EMPTY_WEIGHT, prev - consumption);
          
          if (isBurnerOn && !isLeaking) {
            setUsageIntensitySum(sum => sum + burnerConsumption);
            setTotalUsageTicks(ticks => ticks + 1);
          }

          return nextWeight;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [flameLevel, isBurnerOn, isLeaking, valveOpen]);

  const gasPercentage = Math.max(0, ((weight - EMPTY_WEIGHT) / FULL_WEIGHT) * 100);

  useEffect(() => {
    if (gasPercentage <= 10 && !hasAlertedLowGas && gasPercentage > 0) {
      setHasAlertedLowGas(true);
      addNotification("LOW GAS (10%)! Tap to Book Refill", "warning");
    } else if (gasPercentage > 10) {
      setHasAlertedLowGas(false);
    }
  }, [gasPercentage, hasAlertedLowGas]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHistory(prev => [...prev.slice(-19), { 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
        weight: parseFloat(weight.toFixed(2)), 
        percentage: parseFloat(gasPercentage.toFixed(1)) 
      }]);
    }, 2000);
    return () => clearInterval(interval);
  }, [weight, gasPercentage]);

  useEffect(() => {
    let interval;
    if (isLeaking) {
      interval = setInterval(() => {
        setPpm((prev) => Math.min(1000, prev + Math.random() * 40));
      }, 300);
    } else {
      interval = setInterval(() => {
        setPpm((prev) => Math.max(120, prev - Math.random() * 5));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isLeaking]);

  useEffect(() => {
    if (ppm > 400 && valveOpen) {
      setValveOpen(false);
      setFlameLevel(0);
      addNotification('GAS LEAK DETECTED! Supply cut off.', 'danger');
    }
  }, [ppm, valveOpen]);

  const addNotification = (message, type) => {
    setNotifications((prev) => [
      { id: Date.now(), message, type, time: new Date().toLocaleTimeString() },
      ...prev
    ].slice(0, 10));
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter(n => n.id !== id));
  };

  const refill = () => {
    setWeight(TOTAL_FULL);
    setValveOpen(true);
    setHasAlertedLowGas(false);
    setUsageIntensitySum(0);
    setTotalUsageTicks(0);
    addNotification('Cylinder refilled & learning reset.', 'info');
  };

  const resetPpm = () => {
    setPpm(120);
    setIsLeaking(false);
    addNotification('MQ-2 Sensor Reset.', 'info');
  };

  const toggleValve = () => {
    if (ppm > 400 && !valveOpen) {
      addNotification('Cannot open valve: Gas levels too high!', 'danger');
      return;
    }
    setValveOpen(!valveOpen);
    addNotification(`Valve manually ${!valveOpen ? 'Opened' : 'Closed'}.`, 'info');
  };


  const usableGas = weight - EMPTY_WEIGHT;
  let estimateDays = 0;
  let isLearning = true;

  if (totalUsageTicks > 50) {
    isLearning = false;
    const avgConsumptionPerHour = (usageIntensitySum / totalUsageTicks) * 10;
    const avgDailyConsumption = avgConsumptionPerHour * 2;
    estimateDays = Math.round(usableGas / Math.max(0.1, avgDailyConsumption));
  } else {
    estimateDays = Math.round(usableGas / 0.4);
  }

  return {
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
    setValveOpen,
    gasPercentage,
    notifications,
    removeNotification,
    history,
    refill,
    estimateDays,
    isLearning,
    addNotification
  };
}
