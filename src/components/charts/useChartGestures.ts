'use client';

import { useCallback, useRef, useState } from 'react';

export type ChartGestureState = {
  scale: number;
  tx: number;
  ty: number;
};

export type ChartGestureHandlers = {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
  onWheel: (e: React.WheelEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
};

type PointerRec = { x: number; y: number; id: number };

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const SCALE_STEP = 0.15;

export function useChartGestures(opts: { enabled?: boolean } = {}) {
  const { enabled = true } = opts;
  const [state, setState] = useState<ChartGestureState>({
    scale: 1,
    tx: 0,
    ty: 0,
  });

  const pointers = useRef(new Map<number, PointerRec>());
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null);
  const panStart = useRef<{
    x: number;
    y: number;
    tx: number;
    ty: number;
  } | null>(null);

  const reset = useCallback(() => setState({ scale: 1, tx: 0, ty: 0 }), []);

  const clamp = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      const el = e.currentTarget as Element;
      try {
        (
          el as Element & { setPointerCapture?: (id: number) => void }
        ).setPointerCapture?.(e.pointerId);
      } catch {
        /* noop */
      }
      pointers.current.set(e.pointerId, {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
      });
      const list = [...pointers.current.values()];
      if (list.length === 2) {
        const dx = list[0].x - list[1].x;
        const dy = list[0].y - list[1].y;
        pinchStart.current = {
          dist: Math.hypot(dx, dy),
          scale: state.scale,
        };
      } else if (list.length === 1 && state.scale > 1) {
        panStart.current = {
          x: list[0].x,
          y: list[0].y,
          tx: state.tx,
          ty: state.ty,
        };
      }
    },
    [enabled, state.scale, state.tx, state.ty],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      const p = pointers.current.get(e.pointerId);
      if (!p) return;
      p.x = e.clientX;
      p.y = e.clientY;
      const list = [...pointers.current.values()];

      if (list.length === 2 && pinchStart.current) {
        const dx = list[0].x - list[1].x;
        const dy = list[0].y - list[1].y;
        const dist = Math.hypot(dx, dy);
        const ratio = dist / pinchStart.current.dist;
        setState((s) => ({
          ...s,
          scale: clamp(pinchStart.current!.scale * ratio),
        }));
      } else if (list.length === 1 && panStart.current && state.scale > 1) {
        const dx = list[0].x - panStart.current.x;
        const dy = list[0].y - panStart.current.y;
        setState((s) => ({
          ...s,
          tx: panStart.current!.tx + dx,
          ty: panStart.current!.ty + dy,
        }));
      }
    },
    [enabled, state.scale],
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) panStart.current = null;
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!enabled) return;
      if (!e.ctrlKey && !e.metaKey && Math.abs(e.deltaY) < 2) return;
      e.preventDefault();
      const direction = e.deltaY > 0 ? -1 : 1;
      setState((s) => ({
        ...s,
        scale: clamp(s.scale + direction * SCALE_STEP),
      }));
    },
    [enabled],
  );

  const onDoubleClick = useCallback(() => {
    if (!enabled) return;
    setState((s) =>
      s.scale === 1 ? { scale: 2, tx: 0, ty: 0 } : { scale: 1, tx: 0, ty: 0 },
    );
  }, [enabled]);

  const handlers: ChartGestureHandlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onWheel,
    onDoubleClick,
  };

  return { ...state, handlers, reset };
}
