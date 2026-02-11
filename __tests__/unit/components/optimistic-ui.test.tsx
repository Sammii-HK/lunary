import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import React from 'react';

// ──────────────────────────────────────────────
// Global mocks shared across all component tests
// ──────────────────────────────────────────────

const mockUseAuthStatus = jest.fn();
jest.mock('@/components/AuthStatus', () => ({
  useAuthStatus: () => mockUseAuthStatus(),
}));

const mockHaptic = { light: jest.fn(), success: jest.fn(), error: jest.fn() };
jest.mock('@/hooks/useHaptic', () => ({
  useHaptic: () => mockHaptic,
}));

jest.mock('@/lib/analytics', () => ({
  conversionTracking: { upgradeClicked: jest.fn() },
}));

jest.mock('@/lib/auth-client', () => ({
  betterAuthClient: {
    getSession: jest.fn().mockResolvedValue({ data: { user: null } }),
  },
}));

jest.mock('@/context/UserContext', () => ({
  useUser: () => ({
    user: {
      id: 'user-1',
      name: 'Test User',
      birthday: '1990-01-01',
    },
  }),
}));

jest.mock('@/services/native/haptic-service', () => ({
  hapticService: {
    light: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    medium: jest.fn(),
    heavy: jest.fn(),
  },
}));

// Mock next/link to render a plain anchor (clicks don't navigate in jsdom)
jest.mock('next/link', () => {
  const MockLink = React.forwardRef(function MockLink(
    {
      children,
      onClick,
      href,
      className,
    }: {
      children: React.ReactNode;
      onClick?: (e: React.MouseEvent) => void;
      href: string;
      className?: string;
    },
    ref: any,
  ) {
    return (
      <a href={href} onClick={onClick} className={className} ref={ref}>
        {children}
      </a>
    );
  });
  return MockLink;
});

// Static imports (after mocks are set up)
import { RitualTracker } from '@/components/RitualTracker';
import { SaveToCollection } from '@/components/SaveToCollection';
import { NewsletterSignupForm } from '@/components/NewsletterSignupForm';
import { NotificationSettings } from '@/components/NotificationSettings';
import { EmailSubscriptionSettings } from '@/components/EmailSubscriptionSettings';
import { QuickReflection } from '@/components/QuickReflection';

// ──────────────────────────────────────────────
// Helper: controllable fetch mock
// ──────────────────────────────────────────────

function createControllableFetch() {
  let resolvePromise: (res: Response) => void;
  let rejectPromise: (err: Error) => void;

  const mockFn = jest.fn(
    () =>
      new Promise<Response>((resolve, reject) => {
        resolvePromise = resolve;
        rejectPromise = reject;
      }),
  );

  return {
    mockFn,
    resolve: (data: any, status = 200) => {
      resolvePromise(
        new Response(JSON.stringify(data), {
          status,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    },
    reject: (error: Error) => rejectPromise(error),
  };
}

// ──────────────────────────────────────────────
// 1. RitualTracker
// ──────────────────────────────────────────────
describe('RitualTracker – optimistic UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStatus.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1' },
    });
  });

  async function renderWithStatus(
    status = {
      morning: false,
      evening: false,
      ritualStreak: 3,
      longestRitualStreak: 7,
    },
  ) {
    // First call: GET status fetch. Subsequent calls: POST ritual complete
    const fetchMock = jest
      .fn()
      // initial GET status
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    global.fetch = fetchMock;

    let result: ReturnType<typeof render>;
    await act(async () => {
      result = render(<RitualTracker />);
    });

    return { result: result!, fetchMock };
  }

  it('should immediately show the ritual as completed (optimistic) before API responds', async () => {
    const controllable = createControllableFetch();

    const { fetchMock } = await renderWithStatus({
      morning: false,
      evening: false,
      ritualStreak: 3,
      longestRitualStreak: 7,
    });

    // Override fetch for the POST call
    fetchMock.mockImplementation(controllable.mockFn);

    // Before click, morning should show unchecked circle
    const morningLink = screen.getByText('Morning Ritual').closest('a')!;
    expect(morningLink).toBeTruthy();

    // Click the morning ritual
    await act(async () => {
      fireEvent.click(morningLink);
    });

    // Optimistically: the streak should increment and morning should be checked
    // The API call is still pending (controllable hasn't resolved)
    expect(screen.getByText('4')).toBeInTheDocument(); // streak incremented from 3 to 4

    // Now resolve the API
    await act(async () => {
      controllable.resolve({ ritualStreak: 4, longestRitualStreak: 7 });
    });

    // Still shows 4
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should revert ritual state on API failure', async () => {
    const controllable = createControllableFetch();
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const { fetchMock } = await renderWithStatus({
      morning: false,
      evening: false,
      ritualStreak: 3,
      longestRitualStreak: 7,
    });

    fetchMock.mockImplementation(controllable.mockFn);

    const morningLink = screen.getByText('Morning Ritual').closest('a')!;

    await act(async () => {
      fireEvent.click(morningLink);
    });

    // Optimistically shows 4
    expect(screen.getByText('4')).toBeInTheDocument();

    // API fails
    await act(async () => {
      controllable.reject(new Error('Server error'));
    });

    // Should revert to 3
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('should prevent double-clicks while API call is pending', async () => {
    const controllable = createControllableFetch();

    const { fetchMock } = await renderWithStatus({
      morning: false,
      evening: false,
      ritualStreak: 3,
      longestRitualStreak: 7,
    });

    fetchMock.mockImplementation(controllable.mockFn);

    const morningLink = screen.getByText('Morning Ritual').closest('a')!;

    // First click
    await act(async () => {
      fireEvent.click(morningLink);
    });

    // Second click (should be guarded)
    await act(async () => {
      fireEvent.click(morningLink);
    });

    // The fetch for POST should only have been called once (the controllable mock)
    expect(controllable.mockFn).toHaveBeenCalledTimes(1);

    await act(async () => {
      controllable.resolve({ ritualStreak: 4, longestRitualStreak: 7 });
    });
  });
});

// ──────────────────────────────────────────────
// 2. SaveToCollection
// ──────────────────────────────────────────────
describe('SaveToCollection – optimistic UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStatus.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1' },
    });
  });

  it('should set isSavedInternal immediately on save and not disable the save button', async () => {
    const controllable = createControllableFetch();

    // For fetchDataOnInteraction (collections + folders GET) then handleSave POST
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true, collections: [] }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true, folders: [] }), {
          status: 200,
        }),
      )
      .mockImplementation(controllable.mockFn);

    await act(async () => {
      render(
        <SaveToCollection
          item={{
            title: 'Test Item',
            category: 'insight',
            content: { text: 'hello' },
          }}
        />,
      );
    });

    // Click the save button to open folder dialog
    const saveBtn = screen.getByText('Save');
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    // Wait for the folder dialog to appear (header renders as h3)
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Click the save to collection button in the dialog (it's a button, not the header)
    const saveToCollectionBtn = screen.getByRole('button', {
      name: /Save to Collection/,
    });
    await act(async () => {
      fireEvent.click(saveToCollectionBtn);
    });

    // Optimistically: should show "Saved" immediately (isSavedInternal = true)
    await waitFor(() => {
      expect(screen.getByText('Saved')).toBeInTheDocument();
    });

    // Now resolve the API
    await act(async () => {
      controllable.resolve({ success: true });
    });

    // Still shows saved
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('should revert to unsaved state on API failure', async () => {
    const controllable = createControllableFetch();
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true, collections: [] }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true, folders: [] }), {
          status: 200,
        }),
      )
      .mockImplementation(controllable.mockFn);

    await act(async () => {
      render(
        <SaveToCollection
          item={{
            title: 'Test Item',
            category: 'insight',
            content: { text: 'hello' },
          }}
        />,
      );
    });

    const saveBtn = screen.getByText('Save');
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const saveToCollectionBtn = screen.getByRole('button', {
      name: /Save to Collection/,
    });
    await act(async () => {
      fireEvent.click(saveToCollectionBtn);
    });

    // Optimistically saved
    await waitFor(() => {
      expect(screen.getByText('Saved')).toBeInTheDocument();
    });

    // API fails
    await act(async () => {
      controllable.reject(new Error('Network error'));
    });

    // Should revert – show Save button again
    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});

// ──────────────────────────────────────────────
// 3. NewsletterSignupForm
// ──────────────────────────────────────────────
describe('NewsletterSignupForm – optimistic UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show success state immediately after form submit with valid email', async () => {
    const controllable = createControllableFetch();
    global.fetch = controllable.mockFn;

    await act(async () => {
      render(<NewsletterSignupForm />);
    });

    const input = screen.getByPlaceholderText('you@example.com');
    const submitBtn = screen.getByText('Join the newsletter');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'test@example.com' } });
    });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // Should show success message immediately (optimistic), before API resolves
    await waitFor(() => {
      expect(
        screen.getByText(/Check your inbox to confirm/),
      ).toBeInTheDocument();
    });

    // Input should be cleared
    expect(input).toHaveValue('');

    // Now resolve the API
    await act(async () => {
      controllable.resolve({ success: true });
    });
  });

  it('should revert to form state with email preserved on API failure', async () => {
    const controllable = createControllableFetch();
    global.fetch = controllable.mockFn;
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await act(async () => {
      render(<NewsletterSignupForm />);
    });

    const input = screen.getByPlaceholderText('you@example.com');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'test@example.com' } });
    });

    await act(async () => {
      fireEvent.submit(input.closest('form')!);
    });

    // Optimistic success
    await waitFor(() => {
      expect(
        screen.getByText(/Check your inbox to confirm/),
      ).toBeInTheDocument();
    });

    // API fails
    await act(async () => {
      controllable.reject(new Error('Server error'));
    });

    // Should revert – show error message and restore email
    await waitFor(() => {
      expect(screen.getByText(/Server error/)).toBeInTheDocument();
    });

    // Email should be restored
    expect(screen.getByPlaceholderText('you@example.com')).toHaveValue(
      'test@example.com',
    );

    consoleSpy.mockRestore();
  });

  it('should still validate email client-side before optimistic update', async () => {
    await act(async () => {
      render(<NewsletterSignupForm />);
    });

    const input = screen.getByPlaceholderText('you@example.com');
    const submitBtn = screen.getByText('Join the newsletter');

    // Enter invalid email
    await act(async () => {
      fireEvent.change(input, { target: { value: 'not-an-email' } });
    });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // Should show validation error, not success
    expect(
      screen.getByText('Please enter a valid email address.'),
    ).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────
// 4. NotificationSettings
// ──────────────────────────────────────────────
describe('NotificationSettings – optimistic UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock PushManager
    (window as any).PushManager = jest.fn();

    // Mock VAPID key env var
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY =
      'BJ0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890=';

    // Mock browser APIs
    Object.defineProperty(window, 'Notification', {
      writable: true,
      configurable: true,
      value: { permission: 'granted' },
    });

    const mockSubscription = {
      endpoint: 'https://push.example.com/abc',
      unsubscribe: jest.fn().mockResolvedValue(true),
      toJSON: () => ({
        endpoint: 'https://push.example.com/abc',
        keys: { p256dh: 'key1', auth: 'key2' },
      }),
    };

    // serviceWorker is already defined in jest.setup.js - modify its properties directly
    const sw = navigator.serviceWorker as any;
    sw.getRegistration = jest.fn().mockResolvedValue({
      pushManager: {
        getSubscription: jest.fn().mockResolvedValue(mockSubscription),
      },
    });
    sw.ready = Promise.resolve({
      pushManager: {
        getSubscription: jest.fn().mockResolvedValue(mockSubscription),
      },
    });
    sw.register = jest.fn();
    sw.controller = null;
  });

  it('should flip tarot toggle immediately before API responds', async () => {
    const controllable = createControllableFetch();

    global.fetch = jest
      .fn()
      // check-tarot-status
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ enabled: false }), { status: 200 }),
      )
      // weekly-report GET
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ enabled: false }), { status: 200 }),
      )
      // toggle tarot POST (controllable)
      .mockImplementation(controllable.mockFn);

    await act(async () => {
      render(<NotificationSettings />);
    });

    // Wait for component to finish loading
    await waitFor(() => {
      expect(screen.getByText(/Personalized Daily Tarot$/)).toBeInTheDocument();
    });

    // Find the tarot toggle button
    const tarotSection = screen
      .getByText(/Personalized Daily Tarot$/)
      .closest('div')!;
    const toggleBtn = tarotSection.parentElement!.querySelector('button')!;

    // Toggle should currently be in "off" state (bg-zinc-600)
    expect(toggleBtn.className).toContain('bg-zinc-600');

    // Click the toggle
    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    // Should immediately flip to "on" state (optimistic)
    expect(toggleBtn.className).toContain('bg-lunary-primary-600');

    // Resolve the API
    await act(async () => {
      controllable.resolve({ success: true });
    });

    // Still on
    expect(toggleBtn.className).toContain('bg-lunary-primary-600');
  });

  it('should revert tarot toggle on API failure', async () => {
    const controllable = createControllableFetch();
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ enabled: false }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ enabled: false }), { status: 200 }),
      )
      .mockImplementation(controllable.mockFn);

    await act(async () => {
      render(<NotificationSettings />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Personalized Daily Tarot$/)).toBeInTheDocument();
    });

    const tarotSection = screen
      .getByText(/Personalized Daily Tarot$/)
      .closest('div')!;
    const toggleBtn = tarotSection.parentElement!.querySelector('button')!;

    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    // Optimistically on
    expect(toggleBtn.className).toContain('bg-lunary-primary-600');

    // API fails
    await act(async () => {
      controllable.reject(new Error('Server error'));
    });

    // Should revert to off
    await waitFor(() => {
      expect(toggleBtn.className).toContain('bg-zinc-600');
    });

    alertSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('should flip weekly report toggle immediately before API responds', async () => {
    const controllable = createControllableFetch();

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ enabled: false }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ enabled: false }), { status: 200 }),
      )
      .mockImplementation(controllable.mockFn);

    await act(async () => {
      render(<NotificationSettings />);
    });

    await waitFor(() => {
      expect(
        screen.getByText('Weekly Cosmic Report', { exact: false }),
      ).toBeInTheDocument();
    });

    const weeklySection = screen
      .getByText('Weekly Cosmic Report', { exact: false })
      .closest('div')!;
    const toggleBtn = weeklySection.parentElement!.querySelector('button')!;

    expect(toggleBtn.className).toContain('bg-zinc-600');

    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    // Optimistically on
    expect(toggleBtn.className).toContain('bg-lunary-primary-600');

    await act(async () => {
      controllable.resolve({ success: true });
    });
  });
});

// ──────────────────────────────────────────────
// 5. EmailSubscriptionSettings
// ──────────────────────────────────────────────
describe('EmailSubscriptionSettings – optimistic UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStatus.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com' },
      profile: { id: '1' },
    });
  });

  it('should flip subscription toggle immediately before API responds', async () => {
    const controllable = createControllableFetch();

    // First: check subscription status GET, then toggle POST
    global.fetch = jest
      .fn()
      // GET subscription status
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ subscriber: { is_active: false } }), {
          status: 200,
        }),
      )
      // Toggle POST (controllable)
      .mockImplementation(controllable.mockFn);

    await act(async () => {
      render(<EmailSubscriptionSettings />);
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Not Subscribed')).toBeInTheDocument();
    });

    // Find the toggle button (the one with the sliding circle)
    const toggleButtons = screen.getAllByRole('button');
    // The toggle is the one with rounded-full class
    const toggle = toggleButtons.find((btn) =>
      btn.className.includes('rounded-full'),
    )!;
    expect(toggle).toBeTruthy();

    await act(async () => {
      fireEvent.click(toggle);
    });

    // Optimistically: should show Subscribed immediately
    expect(screen.getByText('Subscribed')).toBeInTheDocument();

    // Resolve
    await act(async () => {
      controllable.resolve({ success: true });
    });

    expect(screen.getByText('Subscribed')).toBeInTheDocument();
  });

  it('should revert subscription toggle on API failure', async () => {
    const controllable = createControllableFetch();
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ subscriber: { is_active: false } }), {
          status: 200,
        }),
      )
      .mockImplementation(controllable.mockFn);

    await act(async () => {
      render(<EmailSubscriptionSettings />);
    });

    await waitFor(() => {
      expect(screen.getByText('Not Subscribed')).toBeInTheDocument();
    });

    const toggleButtons = screen.getAllByRole('button');
    const toggle = toggleButtons.find((btn) =>
      btn.className.includes('rounded-full'),
    )!;

    await act(async () => {
      fireEvent.click(toggle);
    });

    // Optimistically subscribed
    expect(screen.getByText('Subscribed')).toBeInTheDocument();

    // API fails
    await act(async () => {
      controllable.reject(new Error('Network error'));
    });

    // Should revert
    await waitFor(() => {
      expect(screen.getByText('Not Subscribed')).toBeInTheDocument();
    });

    alertSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});

// ──────────────────────────────────────────────
// 6. QuickReflection
// ──────────────────────────────────────────────
describe('QuickReflection – optimistic UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should clear form and close modal immediately on submit', async () => {
    let resolveSubmit: () => void;
    const onSubmit = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
    );
    const onClose = jest.fn();

    await act(async () => {
      render(
        <QuickReflection isOpen={true} onClose={onClose} onSubmit={onSubmit} />,
      );
    });

    const textarea = screen.getByPlaceholderText("What's on your mind?");

    await act(async () => {
      fireEvent.change(textarea, {
        target: { value: 'My reflection content' },
      });
    });

    expect(textarea).toHaveValue('My reflection content');

    // Submit the form
    const submitBtn = screen.getByText('Save Reflection');
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // Optimistically: onClose should have been called immediately
    expect(onClose).toHaveBeenCalledTimes(1);

    // onSubmit should have been called with the content
    expect(onSubmit).toHaveBeenCalledWith('My reflection content', []);

    // Resolve the submit
    await act(async () => {
      resolveSubmit!();
    });
  });

  it('should restore form content and re-open modal on API failure', async () => {
    const onSubmit = jest.fn().mockRejectedValue(new Error('Save failed'));
    const onClose = jest.fn();
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <QuickReflection isOpen={true} onClose={onClose} onSubmit={onSubmit} />,
    );

    const textarea = screen.getByPlaceholderText("What's on your mind?");

    await act(async () => {
      fireEvent.change(textarea, {
        target: { value: 'My reflection content' },
      });
    });

    const submitBtn = screen.getByText('Save Reflection');
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // The onClose was called optimistically
    expect(onClose).toHaveBeenCalled();

    // But since onSubmit rejected, the content should be restored
    // The textarea value should be restored to the original content
    await waitFor(() => {
      const textareaAfter = screen.getByPlaceholderText("What's on your mind?");
      expect(textareaAfter).toHaveValue('My reflection content');
    });

    consoleSpy.mockRestore();
  });
});
