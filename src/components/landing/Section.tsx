import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('opacity-100', 'translate-y-0');
          el.classList.remove('opacity-0', 'translate-y-6');
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export function Section({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useFadeIn();
  return (
    <section ref={ref} id={id} className={cn('opacity-0 translate-y-6 transition-all duration-700 ease-out', className)}>
      {children}
    </section>
  );
}
