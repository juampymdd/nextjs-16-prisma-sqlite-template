"use client";

import { useEffect, useState } from "react";
import { 
  isPast, 
  differenceInSeconds, 
  intervalToDuration,
  addMinutes
} from "date-fns";
import { es } from "date-fns/locale";
import { Clock } from "lucide-react";
import { cn } from "@/libs/utils";

interface TaskCountdownProps {
  dueDate: string;
  completed?: boolean;
}

export function TaskCountdown({ dueDate, completed }: TaskCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [critical, setCritical] = useState(false);

  useEffect(() => {
    // Normalizamos la fecha para ignorar el desfase de UTC si viene de un input date
    const target = addMinutes(new Date(dueDate), new Date().getTimezoneOffset());
    
    const updateCountdown = () => {
      const now = new Date();
      if (isPast(target)) {
        setTimeLeft("Vencido");
        setCritical(true);
        return;
      }

      const diffInSec = differenceInSeconds(target, now);
      setCritical(diffInSec < 3600 * 24); // Crítico si falta menos de 24h

      const duration = intervalToDuration({ start: now, end: target });
      
      let timeString = "";
      if (duration.days && duration.days > 0) {
        timeString = `${duration.days}d ${duration.hours}h ${duration.minutes}m`;
      } else if (duration.hours && duration.hours > 0) {
        timeString = `${duration.hours}h ${duration.minutes}m ${duration.seconds}s`;
      } else {
        timeString = `${duration.minutes}m ${duration.seconds}s`;
      }
      
      setTimeLeft(timeString);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000); 

    return () => clearInterval(interval);
  }, [dueDate]);

  if (completed) return null;

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 shadow-sm",
      critical 
        ? "bg-red-600 text-white animate-pulse ring-2 ring-red-600/20" 
        : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
    )}>
      <Clock size={11} strokeWidth={3} className={cn(critical ? "animate-spin-slow" : "")} />
      <span className="tabular-nums">{timeLeft}</span>
    </div>
  );
}

