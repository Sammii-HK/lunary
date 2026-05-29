/**
 * @jest-environment jsdom
 *
 * VITAL OP - Native-iOS detection gate (src/hooks/useNativePlatform.ts).
 *
 * useIsNativeIOS() decides whether the iOS-native paywall / IAP path is shown
 * instead of the Stripe web checkout. Getting this wrong is a store-compliance
 * and revenue problem in BOTH directions:
 *   - false positive on web -> a web user is shown the iOS IAP path and cannot
 *     pay (lost conversion);
 *   - false negative in the iOS app -> Stripe web checkout is offered inside the
 *     native app, which breaches App Store rules.
 *
 * The decision is `Capacitor.isNativePlatform() && getPlatform() === 'ios'`.
 *
 * There is no existing test for this hook. The hook memoises getPlatform() at
 * module scope, so each scenario renders inside jest.isolateModules() with a
 * fresh React + react-dom + the hook from ONE module registry (mixing a reset
 * hook with an outer React copy breaks the hooks dispatcher). We drive the
 * mounted effect with ReactDOM + act directly to avoid @testing-library's
 * module-level lifecycle hooks. Pure logic. No network/DB. Deterministic.
 */

const isNativePlatform = jest.fn();
const getPlatform = jest.fn();

jest.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => isNativePlatform(),
    getPlatform: () => getPlatform(),
  },
}));

/**
 * Mount useIsNativeIOS() once inside a fresh module registry (resetting the
 * hook's module-scope platform cache) and return its resolved value after the
 * mount effect has run.
 */
function renderHookValue(): boolean | null {
  let value: boolean | null = null;
  jest.isolateModules(() => {
    const React = require('react');
    const ReactDOM = require('react-dom/client');
    const { act } = require('react-dom/test-utils');
    const { useIsNativeIOS } = require('@/hooks/useNativePlatform');

    function Probe() {
      value = useIsNativeIOS();
      return null;
    }

    const container = document.createElement('div');
    const root = ReactDOM.createRoot(container);
    act(() => {
      root.render(React.createElement(Probe));
    });
    // Second act flush so the mount (passive) effect that sets the value runs
    // inside act() — keeps the resolved value committed and the output clean.
    act(() => {});
  });
  return value;
}

afterEach(() => {
  isNativePlatform.mockReset();
  getPlatform.mockReset();
});

describe('VITAL ios-gate - useIsNativeIOS', () => {
  it('resolves to TRUE only on a native iOS platform', () => {
    isNativePlatform.mockReturnValue(true);
    getPlatform.mockReturnValue('ios');
    expect(renderHookValue()).toBe(true);
  });

  it('resolves to FALSE on a native Android platform (iOS gate is exclusive)', () => {
    isNativePlatform.mockReturnValue(true);
    getPlatform.mockReturnValue('android');
    expect(renderHookValue()).toBe(false);
  });

  it('resolves to FALSE on the web even if getPlatform() reports ios (isNativePlatform is authoritative)', () => {
    // A web build must never show the native iOS IAP path. The
    // isNativePlatform() guard short-circuits the platform check.
    isNativePlatform.mockReturnValue(false);
    getPlatform.mockReturnValue('ios');
    expect(renderHookValue()).toBe(false);
  });

  it('resolves to FALSE on a plain web platform', () => {
    isNativePlatform.mockReturnValue(false);
    getPlatform.mockReturnValue('web');
    expect(renderHookValue()).toBe(false);
  });

  it('returns a concrete boolean once mounted (the gate always picks a branch)', () => {
    // Consumer contract: after mount the value is a real boolean, so a gate
    // like `isIOS === true ? <IOSPaywall/> : <WebCheckout/>` always resolves to
    // exactly one branch and never gets stuck on the unknown (null) state.
    isNativePlatform.mockReturnValue(true);
    getPlatform.mockReturnValue('ios');
    expect(typeof renderHookValue()).toBe('boolean');
  });
});
