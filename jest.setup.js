import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import {
  ReadableStream,
  WritableStream,
  TransformStream,
} from 'web-streams-polyfill/ponyfill';
import dotenv from 'dotenv';

// Polyfill Web Streams API for AI SDK v6
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = ReadableStream;
}
if (typeof global.WritableStream === 'undefined') {
  global.WritableStream = WritableStream;
}
if (typeof global.TransformStream === 'undefined') {
  global.TransformStream = TransformStream;
}

// Set default environment variables for tests
if (!process.env.BETTER_AUTH_SECRET) {
  process.env.BETTER_AUTH_SECRET = 'test-secret-key-for-jest-tests-only';
}

if (!process.env.STRIPE_SECRET_KEY) {
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key_for_testing';
}

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

if (typeof global.clearImmediate !== 'function') {
  global.clearImmediate = (handle) => clearTimeout(handle);
}

if (typeof window !== 'undefined') {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: jest.fn(),
  });

  Object.defineProperty(navigator, 'geolocation', {
    writable: true,
    value: {
      getCurrentPosition: jest.fn(),
      watchPosition: jest.fn(),
      clearWatch: jest.fn(),
    },
  });

  Object.defineProperty(navigator, 'serviceWorker', {
    writable: true,
    value: {
      register: jest.fn(() => Promise.resolve()),
      ready: Promise.resolve(),
      controller: null,
    },
  });

  Object.defineProperty(navigator, 'clipboard', {
    writable: true,
    configurable: true,
    value: {
      writeText: jest.fn(() => Promise.resolve()),
      readText: jest.fn(() => Promise.resolve('')),
    },
  });
}

if (typeof window !== 'undefined') {
  global.Request = class Request {
    constructor(input, init = {}) {
      const url = typeof input === 'string' ? input : input.url;
      Object.defineProperty(this, 'url', {
        value: url,
        writable: false,
        enumerable: true,
        configurable: false,
      });
      this.method = init.method || 'GET';
      this.headers = new Headers(init.headers);
      this.body = init.body;
    }
  };

  global.Response = class Response {
    constructor(body, init = {}) {
      this._body = body || '';
      this.status = init.status || 200;
      this.statusText = init.statusText || 'OK';
      this.headers = new Headers(init.headers);
      this.ok = this.status >= 200 && this.status < 300;
    }

    async json() {
      if (!this._body || this._body === '') {
        return null;
      }
      return typeof this._body === 'string'
        ? JSON.parse(this._body)
        : this._body;
    }

    async text() {
      if (!this._body) {
        return '';
      }
      return typeof this._body === 'string'
        ? this._body
        : JSON.stringify(this._body);
    }

    clone() {
      return new Response(this._body, {
        status: this.status,
        statusText: this.statusText,
        headers: this.headers,
      });
    }

    static json(data, init = {}) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init.headers,
        },
      });
    }
  };

  global.NextResponse = class NextResponse extends Response {
    constructor(body, init = {}) {
      super(body, init);
    }

    static json(data, init = {}) {
      const body = JSON.stringify(data);
      const response = new NextResponse(body, {
        status: init.status || 200,
        headers: {
          'Content-Type': 'application/json',
          ...init.headers,
        },
      });
      return response;
    }
  };

  global.Headers = class Headers {
    constructor(init = {}) {
      this._headers = {};
      if (init instanceof Headers) {
        init.forEach((value, key) => {
          this._headers[key.toLowerCase()] = value;
        });
      } else if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this._headers[key.toLowerCase()] = value;
        });
      }
    }

    get(name) {
      return this._headers[name.toLowerCase()] || null;
    }

    set(name, value) {
      this._headers[name.toLowerCase()] = value;
    }

    has(name) {
      return name.toLowerCase() in this._headers;
    }

    forEach(callback) {
      Object.entries(this._headers).forEach(([key, value]) => {
        callback(value, key);
      });
    }

    entries() {
      return Object.entries(this._headers)
        .map(([key, value]) => [key, value])
        [Symbol.iterator]();
    }

    [Symbol.iterator]() {
      return Object.entries(this._headers)[Symbol.iterator]();
    }

    keys() {
      return Object.keys(this._headers);
    }

    values() {
      return Object.values(this._headers);
    }
  };
}

const { fetch: undiciFetch } = require('undici');
const nativeFetch = global.fetch || undiciFetch;

global.fetch = jest.fn((url, options = {}) => {
  if (
    nativeFetch &&
    typeof url === 'string' &&
    process.env.RUN_LOCATIONIQ_TESTS
  ) {
    try {
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === 'https:';
      const isAllowedHost = parsedUrl.hostname === 'us1.locationiq.com';
      if (isHttps && isAllowedHost) {
        return nativeFetch(url, options);
      }
    } catch {
      // Invalid URL; fall through to mocked behavior.
    }
  }

  const method = options.method || 'GET';
  const headers = options.headers || {};
  const cookieHeader = headers.Cookie || headers.cookie || '';

  let status = 200;
  let responseData = {};

  if (url.includes('/api/health')) {
    responseData = { status: 'ok' };
  } else if (url.includes('/api/shop/products')) {
    responseData = [];
  } else if (url.includes('/api/shop/purchases')) {
    responseData = { success: true };
  } else if (url.includes('/api/shop/download')) {
    status = url.includes('test-token') ? 200 : 404;
    responseData = { downloadUrl: 'https://example.com/file.pdf' };
  } else if (url.includes('/api/stripe/create-checkout-session')) {
    responseData = { sessionId: 'test_session_id' };
  } else if (url.includes('/api/stripe/webhooks')) {
    responseData = { received: true };
  } else if (url.includes('/api/admin')) {
    status = cookieHeader.includes('auth-token') ? 200 : 401;
    if (status === 200) {
      responseData = { metrics: {} };
    }
  } else if (url.includes('/api/grimoire')) {
    responseData = { entries: [] };
  } else if (url.includes('/api/newsletter/subscribers')) {
    responseData = { success: true };
  } else if (url.includes('/api/newsletter/verify')) {
    status = url.includes('test-token') ? 200 : 404;
    responseData = { verified: true };
  }

  return Promise.resolve(
    new Response(JSON.stringify(responseData), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
});
