interface MarqueeTextProps {
  text: string;
  baseVelocity?: number;
  className?: string;
}

const MarqueeText = ({ text, className = '' }: MarqueeTextProps) => {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="animate-marquee whitespace-nowrap flex">
        {[...Array(6)].map((_, i) => (
          <span
            key={i}
            className="font-display text-4xl md:text-6xl lg:text-8xl uppercase tracking-wider opacity-10 mx-4 inline-block"
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeText;
