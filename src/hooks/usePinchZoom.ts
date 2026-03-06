import { useRef, useState, useCallback, useEffect } from 'react';

interface PinchZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

export function usePinchZoom(minScale = 0.5, maxScale = 3) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<PinchZoomState>({ scale: 1, translateX: 0, translateY: 0 });
  const stateRef = useRef(state);
  stateRef.current = state;

  // Pinch tracking
  const lastDistRef = useRef<number | null>(null);
  const lastCenterRef = useRef<{ x: number; y: number } | null>(null);
  // Pan tracking (single finger)
  const isPanningRef = useRef(false);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);

  const clampScale = useCallback((s: number) => Math.min(maxScale, Math.max(minScale, s)), [minScale, maxScale]);

  const reset = useCallback(() => {
    setState({ scale: 1, translateX: 0, translateY: 0 });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const getDistance = (t1: Touch, t2: Touch) =>
      Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

    const getCenter = (t1: Touch, t2: Touch) => ({
      x: (t1.clientX + t2.clientX) / 2,
      y: (t1.clientY + t2.clientY) / 2,
    });

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        lastDistRef.current = getDistance(e.touches[0], e.touches[1]);
        lastCenterRef.current = getCenter(e.touches[0], e.touches[1]);
        isPanningRef.current = false;
      } else if (e.touches.length === 1 && stateRef.current.scale > 1) {
        isPanningRef.current = true;
        lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && lastDistRef.current !== null) {
        e.preventDefault();
        const newDist = getDistance(e.touches[0], e.touches[1]);
        const newCenter = getCenter(e.touches[0], e.touches[1]);
        const ratio = newDist / lastDistRef.current;

        setState(prev => {
          const newScale = clampScale(prev.scale * ratio);
          // Translate to keep center point stable
          const dx = lastCenterRef.current ? newCenter.x - lastCenterRef.current.x : 0;
          const dy = lastCenterRef.current ? newCenter.y - lastCenterRef.current.y : 0;
          return {
            scale: newScale,
            translateX: prev.translateX + dx,
            translateY: prev.translateY + dy,
          };
        });

        lastDistRef.current = newDist;
        lastCenterRef.current = newCenter;
      } else if (e.touches.length === 1 && isPanningRef.current && lastTouchRef.current) {
        e.preventDefault();
        const dx = e.touches[0].clientX - lastTouchRef.current.x;
        const dy = e.touches[0].clientY - lastTouchRef.current.y;
        setState(prev => ({
          ...prev,
          translateX: prev.translateX + dx,
          translateY: prev.translateY + dy,
        }));
        lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        lastDistRef.current = null;
        lastCenterRef.current = null;
      }
      if (e.touches.length === 0) {
        isPanningRef.current = false;
        lastTouchRef.current = null;
        // Snap back if zoomed out below 1
        setState(prev => {
          if (prev.scale <= 1) return { scale: 1, translateX: 0, translateY: 0 };
          return prev;
        });
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [clampScale]);

  return { containerRef, ...state, reset };
}
