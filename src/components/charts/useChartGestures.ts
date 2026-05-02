'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SetStateAction } from 'react';

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
const PAN_THRESHOLD = 8;
const PINCH_THRESHOLD = 8;
const TAP_SUPPRESS_MS = 180;
const MAX_PAN = 120;

export function useChartGestures(opts: { enabled?: boolean } = {}) {
  const { enabled = true } = opts;
  const [state, setState] = useState<ChartGestureState>({
    scale: 1,
    tx: 0,
    ty: 0,
  });

  const stateRef = useRef(state);
  const pointers = useRef(new Map<number, PointerRec>());
  const pinchStart = useRef<{
    dist: number;
    scale: number;
    tx: number;
    ty: number;
    midX: number;
    midY: number;
    active: boolean;
  } | null>(null);
  const panStart = useRef<{
    x: number;
    y: number;
    tx: number;
    ty: number;
    active: boolean;
  } | null>(null);
  const suppressTapUntil = useRef(0);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const updateState = useCallback((next: SetStateAction<ChartGestureState>) => {
    setState((current) => {
      const resolved = typeof next === 'function' ? next(current) : next;
      stateRef.current = resolved;
      return resolved;
    });
  }, []);

  const reset = useCallback(
    () => updateState({ scale: 1, tx: 0, ty: 0 }),
    [updateState],
  );

  const clamp = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
  const clampPan = (tx: number, ty: number, scale: number) => {
    if (scale <= MIN_SCALE) return { tx: 0, ty: 0 };
    const limit = MAX_PAN * (scale - 1);
    return {
      tx: Math.min(limit, Math.max(-limit, tx)),
      ty: Math.min(limit, Math.max(-limit, ty)),
    };
  };

  const suppressTap = useCallback(
    () => Date.now() < suppressTapUntil.current,
    [],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      try {
        e.currentTarget.setPointerCapture?.(e.pointerId);
      } catch {
        // Some SVG/browser combinations reject capture during fast gestures.
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
        const current = stateRef.current;
        pinchStart.current = {
          dist: Math.hypot(dx, dy),
          scale: current.scale,
          tx: current.tx,
          ty: current.ty,
          midX: (list[0].x + list[1].x) / 2,
          midY: (list[0].y + list[1].y) / 2,
          active: false,
        };
        panStart.current = null;
      } else if (list.length === 1 && stateRef.current.scale > 1) {
        const current = stateRef.current;
        panStart.current = {
          x: list[0].x,
          y: list[0].y,
          tx: current.tx,
          ty: current.ty,
          active: false,
        };
      }
    },
    [enabled],
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
        if (pinchStart.current.dist <= 0) return;
        const ratio = dist / pinchStart.current.dist;
        const midX = (list[0].x + list[1].x) / 2;
        const midY = (list[0].y + list[1].y) / 2;
        const distanceDelta = Math.abs(dist - pinchStart.current.dist);
        const midpointDelta = Math.hypot(
          midX - pinchStart.current.midX,
          midY - pinchStart.current.midY,
        );
        if (
          !pinchStart.current.active &&
          distanceDelta < PINCH_THRESHOLD &&
          midpointDelta < PINCH_THRESHOLD
        ) {
          return;
        }
        pinchStart.current.active = true;
        if (e.cancelable) e.preventDefault();
        const nextScale = clamp(pinchStart.current!.scale * ratio);
        const nextPan = clampPan(
          pinchStart.current.tx + midX - pinchStart.current.midX,
          pinchStart.current.ty + midY - pinchStart.current.midY,
          nextScale,
        );
        updateState({
          scale: nextScale,
          tx: nextPan.tx,
          ty: nextPan.ty,
        });
      } else if (
        list.length === 1 &&
        panStart.current &&
        stateRef.current.scale > 1
      ) {
        const dx = list[0].x - panStart.current.x;
        const dy = list[0].y - panStart.current.y;
        if (!panStart.current.active && Math.hypot(dx, dy) < PAN_THRESHOLD) {
          return;
        }
        panStart.current.active = true;
        if (e.cancelable) e.preventDefault();
        updateState((s) => ({
          scale: s.scale,
          ...clampPan(
            panStart.current!.tx + dx,
            panStart.current!.ty + dy,
            s.scale,
          ),
        }));
      }
    },
    [enabled, updateState],
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const hadGesture = Boolean(
      pinchStart.current?.active || panStart.current?.active,
    );
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignore release failures for pointers the browser already dropped.
    }
    pointers.current.delete(e.pointerId);

    if (hadGesture) suppressTapUntil.current = Date.now() + TAP_SUPPRESS_MS;
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) {
      panStart.current = null;
    } else if (pointers.current.size === 1 && stateRef.current.scale > 1) {
      const [remaining] = pointers.current.values();
      panStart.current = {
        x: remaining.x,
        y: remaining.y,
        tx: stateRef.current.tx,
        ty: stateRef.current.ty,
        active: false,
      };
    }
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!enabled) return;
      if (!e.ctrlKey && !e.metaKey && Math.abs(e.deltaY) < 2) return;
      if (e.cancelable) e.preventDefault();
      const direction = e.deltaY > 0 ? -1 : 1;
      updateState((s) => {
        const nextScale = clamp(s.scale + direction * SCALE_STEP);
        return {
          scale: nextScale,
          ...clampPan(s.tx, s.ty, nextScale),
        };
      });
    },
    [enabled, updateState],
  );

  const onDoubleClick = useCallback(() => {
    if (!enabled) return;
    updateState((s) =>
      s.scale === 1 ? { scale: 2, tx: 0, ty: 0 } : { scale: 1, tx: 0, ty: 0 },
    );
  }, [enabled, updateState]);

  const handlers: ChartGestureHandlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onWheel,
    onDoubleClick,
  };

  return { ...state, handlers, reset, suppressTap };
}
