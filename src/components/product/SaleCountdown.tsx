import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface SaleCountdownProps {
  endDate?: Date;
  className?: string;
}

const SaleCountdown = ({ endDate, className = '' }: SaleCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Default end date: end of current week (Sunday midnight)
  const getDefaultEndDate = () => {
    const now = new Date();
    const daysUntilSunday = 7 - now.getDay();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + daysUntilSunday);
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek;
  };

  const targetDate = endDate || getDefaultEndDate();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-secondary text-secondary-foreground font-display text-lg md:text-2xl font-bold px-2 md:px-3 py-1 md:py-2 rounded min-w-[2.5rem] md:min-w-[3.5rem] text-center">
        {value.toString().padStart(2, '0')}
      </div>
      <span className="text-[10px] md:text-xs uppercase tracking-wider text-muted-foreground mt-1">
        {label}
      </span>
    </div>
  );

  return (
    <div className={`bg-destructive/10 border border-destructive/20 rounded-lg p-3 md:p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Timer className="h-4 w-4 text-destructive animate-pulse" />
        <span className="font-display text-xs md:text-sm uppercase tracking-wider text-destructive">
          Sale Ends In
        </span>
      </div>
      <div className="flex items-center justify-center gap-2 md:gap-3">
        <TimeBlock value={timeLeft.days} label="Days" />
        <span className="text-xl md:text-2xl font-bold text-muted-foreground">:</span>
        <TimeBlock value={timeLeft.hours} label="Hours" />
        <span className="text-xl md:text-2xl font-bold text-muted-foreground">:</span>
        <TimeBlock value={timeLeft.minutes} label="Mins" />
        <span className="text-xl md:text-2xl font-bold text-muted-foreground">:</span>
        <TimeBlock value={timeLeft.seconds} label="Secs" />
      </div>
    </div>
  );
};

export default SaleCountdown;
