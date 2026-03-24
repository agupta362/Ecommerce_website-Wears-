import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  className?: string;
}

const Slider = ({ min, max, step = 1, value, onValueChange, className }: SliderProps) => {
  const trackRef = React.useRef<HTMLDivElement>(null);

  const getPercent = (val: number) => {
    if (max === min) return 0;
    return ((val - min) / (max - min)) * 100;
  };

  const getValueFromPosition = (clientX: number): number => {
    const track = trackRef.current;
    if (!track) return min;
    const rect = track.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = min + percent * (max - min);
    const stepped = Math.round(raw / step) * step;
    return Math.max(min, Math.min(max, stepped));
  };

  const handlePointerDown = (thumbIndex: 0 | 1) => (e: React.PointerEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      const newVal = getValueFromPosition(ev.clientX);
      const next: [number, number] = [...value] as [number, number];
      next[thumbIndex] = newVal;
      // Ensure min thumb doesn't pass max and vice versa
      if (thumbIndex === 0 && next[0] > next[1]) next[0] = next[1];
      if (thumbIndex === 1 && next[1] < next[0]) next[1] = next[0];
      onValueChange(next);
    };

    const onUp = () => {
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', onUp);
    };

    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onUp);
  };

  const leftPercent = getPercent(value[0]);
  const rightPercent = getPercent(value[1]);

  return (
    <div className={cn("relative flex w-full select-none items-center h-10", className)} style={{ touchAction: 'none' }}>
      {/* Track */}
      <div ref={trackRef} className="relative h-2 w-full rounded-full bg-muted">
        {/* Active range */}
        <div
          className="absolute h-full bg-primary rounded-full"
          style={{ left: `${leftPercent}%`, width: `${rightPercent - leftPercent}%` }}
        />
      </div>

      {/* Min Thumb */}
      <div
        className="absolute h-6 w-6 rounded-full border-2 border-primary bg-background cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-ring"
        style={{ left: `calc(${leftPercent}% - 12px)` }}
        onPointerDown={handlePointerDown(0)}
      />

      {/* Max Thumb */}
      <div
        className="absolute h-6 w-6 rounded-full border-2 border-primary bg-background cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-ring"
        style={{ left: `calc(${rightPercent}% - 12px)` }}
        onPointerDown={handlePointerDown(1)}
      />
    </div>
  );
};

export { Slider };
