import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: string;
  className?: string;
}

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      className={`inline-block transition-all duration-700 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'} ${className ?? ''}`}
    >
      {value}
    </span>
  );
}
