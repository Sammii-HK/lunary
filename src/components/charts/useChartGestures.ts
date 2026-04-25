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
const TAP_SUPPRESS_MS = 350;

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
  } | null>(null);
  const panStart = useRef<{
    x: number;
    y: number;
    tx: number;
    ty: number;
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

  const suppressTap = useCallback(
    () => Date.now() < suppressTapUntil.current,
    [],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
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
        };
        panStart.current = null;
      } else if (list.length === 1 && stateRef.current.scale > 1) {
        const current = stateRef.current;
        panStart.current = {
          x: list[0].x,
          y: list[0].y,
          tx: current.tx,
          ty: current.ty,
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
        e.preventDefault();
        const dx = list[0].x - list[1].x;
        const dy = list[0].y - list[1].y;
        const dist = Math.hypot(dx, dy);
        if (pinchStart.current.dist <= 0) return;
        const ratio = dist / pinchStart.current.dist;
        const midX = (list[0].x + list[1].x) / 2;
        const midY = (list[0].y + list[1].y) / 2;
        updateState({
          scale: clamp(pinchStart.current!.scale * ratio),
          tx: pinchStart.current.tx + midX - pinchStart.current.midX,
          ty: pinchStart.current.ty + midY - pinchStart.current.midY,
        });
      } else if (
        list.length === 1 &&
        panStart.current &&
        stateRef.current.scale > 1
      ) {
        e.preventDefault();
        const dx = list[0].x - panStart.current.x;
        const dy = list[0].y - panStart.current.y;
        updateState((s) => ({
          scale: s.scale,
          tx: panStart.current!.tx + dx,
          ty: panStart.current!.ty + dy,
        }));
      }
    },
    [enabled, updateState],
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const hadPinch = pointers.current.size >= 2 || pinchStart.current != null;
    pointers.current.delete(e.pointerId);

    if (hadPinch) suppressTapUntil.current = Date.now() + TAP_SUPPRESS_MS;
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
      };
    }
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!enabled) return;
      if (!e.ctrlKey && !e.metaKey && Math.abs(e.deltaY) < 2) return;
      e.preventDefault();
      const direction = e.deltaY > 0 ? -1 : 1;
      updateState((s) => ({
        ...s,
        scale: clamp(s.scale + direction * SCALE_STEP),
      }));
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
