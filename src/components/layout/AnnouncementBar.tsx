import { siteConfig } from '@/config/site.config';
import { useTemplateLayout } from '@/hooks/useTemplateLayout';
import { cn } from '@/lib/utils';

const barStyles: Record<string, string> = {
  'sticky-bold': 'bg-foreground text-background',
  'centered-split': 'bg-primary text-primary-foreground',
  'hamburger-only': 'bg-muted text-muted-foreground',
  'floating-pill': 'bg-foreground text-background',
  'pill-links': 'bg-primary text-primary-foreground',
  'ticker-icons': 'bg-foreground text-accent',
  'light-bottom': 'bg-muted text-muted-foreground',
  'traditional': 'bg-primary text-primary-foreground',
  'newspaper-broadsheet': 'bg-foreground text-background',
};

const AnnouncementBar = () => {
  const text = siteConfig.announcementBar.marqueeText;
  const { navStyle } = useTemplateLayout();
  const style = barStyles[navStyle] || barStyles['sticky-bold'];

  return (
    <div className={cn(style, 'py-2 overflow-hidden')}>
      <div className="animate-marquee whitespace-nowrap flex">
        {[...Array(4)].map((_, i) => (
          <span key={i} className="text-[11px] uppercase tracking-[0.15em] mx-0 inline-block">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBar;
