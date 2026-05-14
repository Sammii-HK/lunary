import { act, renderHook } from '@testing-library/react';
import { useChartGestures } from '@/components/charts/useChartGestures';

function pointerEvent(overrides: Partial<React.PointerEvent> = {}) {
  return {
    pointerId: 1,
    clientX: 100,
    clientY: 100,
    cancelable: true,
    preventDefault: jest.fn(),
    currentTarget: {
      setPointerCapture: jest.fn(),
      releasePointerCapture: jest.fn(),
    },
    ...overrides,
  } as unknown as React.PointerEvent;
}

function wheelEvent(overrides: Partial<React.WheelEvent> = {}) {
  return {
    ctrlKey: true,
    metaKey: false,
    deltaY: -120,
    cancelable: true,
    preventDefault: jest.fn(),
    ...overrides,
  } as unknown as React.WheelEvent;
}

describe('useChartGestures', () => {
  it('zooms from wheel input and keeps transform values numeric', () => {
    const { result } = renderHook(() => useChartGestures());

    act(() => {
      result.current.handlers.onWheel(wheelEvent());
    });

    expect(result.current.scale).toBeGreaterThan(1);
    expect(Number.isFinite(result.current.tx)).toBe(true);
    expect(Number.isFinite(result.current.ty)).toBe(true);
  });

  it('pans after zoom without null transform crashes', () => {
    const { result } = renderHook(() => useChartGestures());

    act(() => {
      result.current.handlers.onDoubleClick({} as React.MouseEvent);
    });

    act(() => {
      result.current.handlers.onPointerDown(pointerEvent());
      result.current.handlers.onPointerMove(
        pointerEvent({ clientX: 140, clientY: 130 }),
      );
      result.current.handlers.onPointerUp(pointerEvent());
    });

    expect(result.current.scale).toBe(2);
    expect(result.current.tx).toBeGreaterThan(0);
    expect(result.current.ty).toBeGreaterThan(0);
  });

  it('handles cancelled gestures cleanly', () => {
    const { result } = renderHook(() => useChartGestures());

    act(() => {
      result.current.handlers.onDoubleClick({} as React.MouseEvent);
      result.current.handlers.onPointerDown(pointerEvent());
      result.current.handlers.onPointerCancel(pointerEvent());
      result.current.handlers.onPointerMove(
        pointerEvent({ clientX: 160, clientY: 160 }),
      );
    });

    expect(result.current.scale).toBe(2);
    expect(Number.isFinite(result.current.tx)).toBe(true);
    expect(Number.isFinite(result.current.ty)).toBe(true);
  });
});
