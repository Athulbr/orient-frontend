import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Toast as ToastType } from './ToastStore';

interface ToastProps extends ToastType {
  onClose: (id: string) => void;
}

const toastTypeConfig = {
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600',
    borderColor: 'border-yellow-200',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
  },
};

export const Toast: React.FC<ToastProps> = ({ id, message, type, title, duration = 2000, onClose }) => {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(duration);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(id);
    }, 300);
  }, [id, onClose]);

  useEffect(() => {
    if (isPaused) return;

    let animationFrame: number;
    const startTime = performance.now();
    const pausedTime = duration - remainingTime;

    const updateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime + pausedTime;
      const newRemainingTime = Math.max(0, duration - elapsed);
      const newProgress = (newRemainingTime / duration) * 100;

      setProgress(newProgress);
      setRemainingTime(newRemainingTime);

      if (newProgress > 0) {
        animationFrame = requestAnimationFrame(updateProgress);
      } else {
        handleClose();
      }
    };

    animationFrame = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [duration, handleClose, isPaused, remainingTime]);

  const config = toastTypeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`pointer-events-auto w-sm transform transition-all duration-300 ease-in-out ${isVisible ? 'animate-toast-slide-in-from-right' : 'animate-toast-slide-out-to-right'}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={`flex cursor-pointer items-start rounded-lg border bg-white p-4 shadow-lg ${config.textColor} ${config.borderColor}`} role="alert">
        <div className="mr-3 flex-shrink-0">
          <Icon className="mt-1 h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold capitalize">{title ? title : type}</h4>
          <p className="mt-1 text-sm">{message}</p>
        </div>
        <button className="ml-3 cursor-pointer hover:opacity-75 focus:outline-none" onClick={handleClose} aria-label="Close notification">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
