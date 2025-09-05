# Testing Guide

## Overview

This comprehensive testing guide covers all testing strategies, methodologies, and implementations for the Lottery Marketing Application. The testing approach ensures high-quality, reliable, and performant code across all features.

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [End-to-End Testing](#end-to-end-testing)
5. [Performance Testing](#performance-testing)
6. [Security Testing](#security-testing)
7. [Accessibility Testing](#accessibility-testing)
8. [Mobile Testing](#mobile-testing)
9. [API Testing](#api-testing)
10. [Firebase Testing](#firebase-testing)
11. [Continuous Integration](#continuous-integration)
12. [Test Coverage](#test-coverage)

## Testing Strategy

### Testing Pyramid

```
       /\
      /E2E\     <- Few, high-value end-to-end tests
     /____\
    /      \
   /Integration\ <- More integration tests
  /__________\
 /            \
/  Unit Tests  \  <- Many fast, isolated unit tests
/______________\
```

### Test Types Distribution

- **Unit Tests**: 70% - Fast, isolated, focused on single functions/components
- **Integration Tests**: 20% - Test component interactions and API integration
- **End-to-End Tests**: 10% - Test complete user workflows

## Unit Testing

### Setup and Configuration

**Jest Configuration** (`jest.config.js`):

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
};

module.exports = createJestConfig(customJestConfig);
```

**Test Setup** (`jest.setup.js`):

```javascript
import '@testing-library/jest-dom';
import 'jest-canvas-mock';

// Mock Firebase
jest.mock('@/lib/firebase/config', () => ({
  auth: {},
  db: {},
  storage: {},
  database: {},
}));

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
  }),
}));

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => key,
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
    },
  }),
}));

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
```

### Component Testing Examples

#### React Component Testing

```typescript
// src/components/ui/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });
});
```

#### Hook Testing

```typescript
// src/hooks/__tests__/useGameCounter.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useGameCounter } from '@/hooks/useGameCounter';
import { realtimeService } from '@/lib/services/realtimeService';

jest.mock('@/lib/services/realtimeService');

describe('useGameCounter Hook', () => {
  const mockRealtimeService = realtimeService as jest.Mocked<
    typeof realtimeService
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with loading state', () => {
    mockRealtimeService.getGameCounter.mockResolvedValue(null);

    const { result } = renderHook(() => useGameCounter('game123'));

    expect(result.current.loading).toBe(true);
    expect(result.current.counter).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('loads game counter data', async () => {
    const mockCounter = {
      gameId: 'game123',
      participants: 50,
      maxParticipants: 100,
      status: 'active',
      lastUpdate: Date.now(),
    };

    mockRealtimeService.getGameCounter.mockResolvedValue(mockCounter);

    const { result } = renderHook(() => useGameCounter('game123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.counter).toEqual(mockCounter);
    });
  });

  it('handles increment participants', async () => {
    const mockCounter = {
      gameId: 'game123',
      participants: 50,
      maxParticipants: 100,
      status: 'active',
      lastUpdate: Date.now(),
    };

    mockRealtimeService.getGameCounter.mockResolvedValue(mockCounter);
    mockRealtimeService.updateGameCounter.mockResolvedValue();

    const { result } = renderHook(() => useGameCounter('game123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.incrementParticipants();

    expect(mockRealtimeService.updateGameCounter).toHaveBeenCalledWith(
      'game123',
      {
        participants: 51,
      }
    );
  });
});
```

#### Service Testing

```typescript
// src/lib/services/__tests__/notificationService.test.ts
import { notificationService } from '@/lib/services/notificationService';
import { firestoreService } from '@/lib/firebase/services';

jest.mock('@/lib/firebase/services');

describe('NotificationService', () => {
  const mockFirestoreService = firestoreService as jest.Mocked<
    typeof firestoreService
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendGameWinnerNotification', () => {
    it('sends notification to winner', async () => {
      const mockUser = {
        id: 'user123',
        fcmToken: 'fcm-token-123',
        notificationPreferences: { gameUpdates: true },
      };

      mockFirestoreService.getUser.mockResolvedValue(mockUser);

      await notificationService.sendGameWinnerNotification({
        userId: 'user123',
        gameName: 'Win iPhone 15',
        prize: 'iPhone 15 Pro',
        prizeValue: 1299,
      });

      expect(mockFirestoreService.getUser).toHaveBeenCalledWith('user123');
    });

    it('skips notification if user preferences disabled', async () => {
      const mockUser = {
        id: 'user123',
        fcmToken: 'fcm-token-123',
        notificationPreferences: { gameUpdates: false },
      };

      mockFirestoreService.getUser.mockResolvedValue(mockUser);

      const result = await notificationService.sendGameWinnerNotification({
        userId: 'user123',
        gameName: 'Win iPhone 15',
        prize: 'iPhone 15 Pro',
        prizeValue: 1299,
      });

      expect(result.skipped).toBe(true);
      expect(result.reason).toBe('User has disabled game update notifications');
    });
  });
});
```

### Utility Function Testing

```typescript
// src/lib/utils/__tests__/validation.test.ts
import {
  validateEmail,
  validatePhone,
  validatePassword,
} from '@/lib/utils/validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.email+tag@example.co.uk')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('validates correct phone numbers', () => {
      expect(validatePhone('+1234567890')).toBe(true);
      expect(validatePhone('+237123456789')).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('invalid')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('validates strong passwords', () => {
      expect(validatePassword('SecurePassword123!')).toBe(true);
    });

    it('rejects weak passwords', () => {
      expect(validatePassword('weak')).toBe(false);
      expect(validatePassword('12345678')).toBe(false);
      expect(validatePassword('password')).toBe(false);
    });
  });
});
```

## Integration Testing

### API Integration Testing

```typescript
// src/__tests__/api/games.integration.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/games/route';
import { initializeTestDb, cleanupTestDb } from '@/lib/test-utils/database';

describe('/api/games Integration', () => {
  beforeAll(async () => {
    await initializeTestDb();
  });

  afterAll(async () => {
    await cleanupTestDb();
  });

  describe('GET /api/games', () => {
    it('returns paginated games list', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { page: '1', limit: '10' },
        headers: {
          authorization: 'Bearer valid-jwt-token',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);

      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.games).toBeInstanceOf(Array);
      expect(data.data.pagination).toHaveProperty('page');
      expect(data.data.pagination).toHaveProperty('total');
    });

    it('filters games by category', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { category: 'electronics' },
        headers: {
          authorization: 'Bearer valid-jwt-token',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);

      const data = JSON.parse(res._getData());
      expect(data.data.games).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: 'electronics',
          }),
        ])
      );
    });

    it('requires authentication', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);

      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('AUTH_REQUIRED');
    });
  });
});
```

### Firebase Integration Testing

```typescript
// src/lib/firebase/__tests__/services.integration.test.ts
import { firestoreService } from '@/lib/firebase/services';
import {
  initializeTestFirebase,
  cleanupTestFirebase,
} from '@/lib/test-utils/firebase';

describe('Firebase Services Integration', () => {
  beforeAll(async () => {
    await initializeTestFirebase();
  });

  afterAll(async () => {
    await cleanupTestFirebase();
  });

  describe('User Management', () => {
    it('creates and retrieves user', async () => {
      const userData = {
        id: 'test-user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER' as const,
      };

      await firestoreService.createUser(userData);
      const retrievedUser = await firestoreService.getUser('test-user-1');

      expect(retrievedUser).toMatchObject(userData);
    });

    it('updates user profile', async () => {
      const userId = 'test-user-2';
      const initialData = {
        id: userId,
        email: 'test2@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER' as const,
      };

      await firestoreService.createUser(initialData);

      const updates = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      await firestoreService.updateUser(userId, updates);
      const updatedUser = await firestoreService.getUser(userId);

      expect(updatedUser).toMatchObject({
        ...initialData,
        ...updates,
      });
    });
  });

  describe('Game Management', () => {
    it('creates game with real-time counter', async () => {
      const gameData = {
        id: 'test-game-1',
        title: 'Test Game',
        description: 'Test game description',
        ticketPrice: 5.99,
        maxParticipants: 100,
        category: 'electronics',
        vendorId: 'test-vendor-1',
        status: 'active' as const,
      };

      await firestoreService.createGame(gameData);
      const retrievedGame = await firestoreService.getGame('test-game-1');

      expect(retrievedGame).toMatchObject(gameData);
    });
  });
});
```

## End-to-End Testing

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Examples

```typescript
// e2e/game-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Game Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup test user
    await page.goto('/');
    await page.getByTestId('login-button').click();
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword');
    await page.click('[data-testid="login-submit"]');
    await expect(page).toHaveURL('/games');
  });

  test('user can browse and purchase game ticket', async ({ page }) => {
    // Browse games
    await page.goto('/games');
    await expect(page.getByTestId('games-grid')).toBeVisible();

    // Select first game
    const firstGame = page.getByTestId('game-card').first();
    await expect(firstGame).toBeVisible();
    await firstGame.click();

    // Verify game detail page
    await expect(page.getByTestId('game-detail')).toBeVisible();
    await expect(page.getByTestId('ticket-price')).toContainText('$');

    // Click purchase button
    await page.getByTestId('purchase-ticket-button').click();

    // Payment modal should open
    await expect(page.getByTestId('payment-modal')).toBeVisible();

    // Fill payment details (test mode)
    await page.selectOption('[data-testid="payment-method"]', 'card');
    await page.fill('[data-testid="card-number"]', '4242424242424242');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvc"]', '123');

    // Submit payment
    await page.click('[data-testid="pay-now-button"]');

    // Wait for success
    await expect(page.getByTestId('payment-success')).toBeVisible();
    await expect(page.getByTestId('ticket-qr-code')).toBeVisible();

    // Verify ticket appears in profile
    await page.goto('/profile');
    await page.click('[data-testid="tickets-tab"]');
    await expect(page.getByTestId('ticket-item').first()).toBeVisible();
  });

  test('user can scan QR code', async ({ page, context }) => {
    // Grant camera permissions for QR scanner
    await context.grantPermissions(['camera']);

    await page.goto('/profile');
    await page.click('[data-testid="tickets-tab"]');

    const firstTicket = page.getByTestId('ticket-item').first();
    await firstTicket.click();

    // Verify QR code is displayed
    await expect(page.getByTestId('qr-code-display')).toBeVisible();

    // Test scan functionality (mock camera input)
    await page.click('[data-testid="scan-ticket-button"]');
    await expect(page.getByTestId('qr-scanner')).toBeVisible();

    // Mock successful scan result
    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('qr-scan-result', {
          detail: { result: 'VALID', ticket: { id: 'test-ticket' } },
        })
      );
    });

    await expect(page.getByTestId('scan-result-valid')).toBeVisible();
  });
});
```

### Cross-browser Testing

```typescript
// e2e/cross-browser.spec.ts
import { test, expect, devices } from '@playwright/test';

const browsers = ['chromium', 'firefox', 'webkit'];
const mobileDevices = ['iPhone 12', 'Pixel 5', 'Galaxy S21'];

browsers.forEach(browserName => {
  test.describe(`${browserName} Browser Tests`, () => {
    test(`navigation works in ${browserName}`, async ({ page }) => {
      await page.goto('/');

      // Test main navigation
      await page.click('[data-testid="games-nav"]');
      await expect(page).toHaveURL('/games');

      await page.click('[data-testid="profile-nav"]');
      await expect(page).toHaveURL('/profile');
    });
  });
});

mobileDevices.forEach(device => {
  test.describe(`Mobile Device: ${device}`, () => {
    test.use(devices[device]);

    test(`responsive design works on ${device}`, async ({ page }) => {
      await page.goto('/');

      // Test mobile menu
      await page.click('[data-testid="mobile-menu-button"]');
      await expect(page.getByTestId('mobile-nav')).toBeVisible();

      // Test swipe gestures on games carousel
      const carousel = page.getByTestId('games-carousel');
      await carousel.swipeLeft();

      // Test touch interactions
      await page.tap('[data-testid="game-card"]');
      await expect(page.getByTestId('game-detail')).toBeVisible();
    });
  });
});
```

## Performance Testing

### Lighthouse Testing

```javascript
// scripts/lighthouse-test.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  };

  const runnerResult = await lighthouse(url, options);
  await chrome.kill();

  const scores = {
    performance: runnerResult.lhr.categories.performance.score * 100,
    accessibility: runnerResult.lhr.categories.accessibility.score * 100,
    bestPractices: runnerResult.lhr.categories['best-practices'].score * 100,
    seo: runnerResult.lhr.categories.seo.score * 100,
  };

  // Assert minimum scores
  Object.entries(scores).forEach(([category, score]) => {
    if (score < 80) {
      throw new Error(`${category} score ${score} is below threshold of 80`);
    }
  });

  return scores;
}

// Test multiple pages
const pages = [
  'http://localhost:3000/',
  'http://localhost:3000/games',
  'http://localhost:3000/profile',
];

Promise.all(pages.map(runLighthouse))
  .then(results => {
    console.log('All Lighthouse tests passed:', results);
  })
  .catch(error => {
    console.error('Lighthouse test failed:', error);
    process.exit(1);
  });
```

### Load Testing

```javascript
// scripts/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export let errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'], // Error rate under 10%
  },
};

const BASE_URL = 'https://your-app.vercel.app';

export default function () {
  // Test homepage
  let response = http.get(`${BASE_URL}/`);
  check(response, {
    'homepage loads': r => r.status === 200,
    'homepage loads in time': r => r.timings.duration < 1000,
  });
  errorRate.add(response.status !== 200);

  sleep(1);

  // Test games API
  response = http.get(`${BASE_URL}/api/games`, {
    headers: { Authorization: 'Bearer test-token' },
  });
  check(response, {
    'games API responds': r => r.status === 200,
    'games API responds quickly': r => r.timings.duration < 500,
  });
  errorRate.add(response.status !== 200);

  sleep(1);
}
```

## Security Testing

### Security Test Suite

```typescript
// src/__tests__/security/api-security.test.ts
import { testApiEndpoint } from '@/lib/test-utils/security';

describe('API Security Tests', () => {
  describe('Authentication', () => {
    it('rejects requests without authentication', async () => {
      const endpoints = [
        '/api/users/profile',
        '/api/games/participate',
        '/api/orders',
        '/api/admin/analytics',
      ];

      for (const endpoint of endpoints) {
        const response = await testApiEndpoint('GET', endpoint);
        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe('AUTH_REQUIRED');
      }
    });

    it('rejects requests with invalid tokens', async () => {
      const response = await testApiEndpoint('GET', '/api/users/profile', {
        headers: { Authorization: 'Bearer invalid-token' },
      });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });
  });

  describe('Authorization', () => {
    it('prevents users from accessing admin endpoints', async () => {
      const userToken = await generateTestToken('USER');
      const response = await testApiEndpoint('GET', '/api/admin/analytics', {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('prevents vendors from accessing other vendors data', async () => {
      const vendorToken = await generateTestToken('VENDOR', {
        vendorId: 'vendor1',
      });
      const response = await testApiEndpoint('GET', '/api/vendor/shop/vendor2');

      expect(response.status).toBe(403);
    });
  });

  describe('Input Validation', () => {
    it('validates required fields', async () => {
      const userToken = await generateTestToken('USER');
      const response = await testApiEndpoint('POST', '/api/orders', {
        headers: { Authorization: `Bearer ${userToken}` },
        body: {}, // Empty body
      });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('sanitizes user input', async () => {
      const userToken = await generateTestToken('USER');
      const maliciousInput = '<script>alert("xss")</script>';

      const response = await testApiEndpoint('PUT', '/api/users/profile', {
        headers: { Authorization: `Bearer ${userToken}` },
        body: { firstName: maliciousInput },
      });

      if (response.status === 200) {
        expect(response.body.data.firstName).not.toContain('<script>');
      }
    });
  });

  describe('Rate Limiting', () => {
    it('enforces rate limits on sensitive endpoints', async () => {
      const requests = Array(101)
        .fill(null)
        .map(() =>
          testApiEndpoint('POST', '/api/auth/login', {
            body: { email: 'test@example.com', password: 'password' },
          })
        );

      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(r => r.status === 429);

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});
```

### SQL Injection Testing

```typescript
// src/__tests__/security/injection.test.ts
describe('Injection Prevention', () => {
  it('prevents NoSQL injection in Firestore queries', async () => {
    const maliciousQueries = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      '{ $ne: null }',
      "'; return { password: 1 }; var foo = '",
    ];

    for (const query of maliciousQueries) {
      const response = await testApiEndpoint(
        'GET',
        `/api/games?search=${encodeURIComponent(query)}`
      );

      // Should either return empty results or validation error, not crash
      expect([200, 400]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.data.games).toBeInstanceOf(Array);
      }
    }
  });

  it('sanitizes file upload names', async () => {
    const maliciousFilenames = [
      '../../../etc/passwd',
      'test.php',
      'virus.exe',
      '<script>alert(1)</script>.jpg',
    ];

    for (const filename of maliciousFilenames) {
      const formData = new FormData();
      const blob = new Blob(['test content'], { type: 'image/jpeg' });
      formData.append('file', blob, filename);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      // Should reject malicious filenames
      expect([400, 403]).toContain(response.status);
    }
  });
});
```

## Accessibility Testing

### Automated Accessibility Testing

```typescript
// src/__tests__/accessibility/a11y.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/Button';
import { GameCard } from '@/components/features/games/components/game-card';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('Button component has no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('GameCard component is accessible', async () => {
    const mockGame = {
      id: 'game1',
      title: 'Win iPhone',
      image: '/game-image.jpg',
      ticketPrice: 5.99,
      currentParticipants: 50,
      maxParticipants: 100,
    };

    const { container } = render(<GameCard game={mockGame} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('form inputs have proper labels', async () => {
    const { container } = render(
      <form>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" required />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" required />
        <button type="submit">Submit</button>
      </form>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('maintains proper heading hierarchy', async () => {
    const { container } = render(
      <div>
        <h1>Main Title</h1>
        <h2>Section Title</h2>
        <h3>Subsection Title</h3>
      </div>
    );

    const results = await axe(container, {
      rules: {
        'heading-order': { enabled: true },
      },
    });
    expect(results).toHaveNoViolations();
  });
});
```

### Keyboard Navigation Testing

```typescript
// e2e/accessibility/keyboard-navigation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation', () => {
  test('user can navigate using only keyboard', async ({ page }) => {
    await page.goto('/');

    // Tab through main navigation
    await page.keyboard.press('Tab'); // Skip to main content link
    await page.keyboard.press('Tab'); // Logo
    await page.keyboard.press('Tab'); // Games nav
    await expect(page.getByTestId('games-nav')).toBeFocused();

    // Navigate to games page using Enter
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/games');

    // Tab through game cards
    await page.keyboard.press('Tab'); // First game card
    await expect(page.getByTestId('game-card').first()).toBeFocused();

    // Use arrow keys to navigate between games
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');

    // Select game with Enter
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('game-detail')).toBeVisible();
  });

  test('focus indicators are visible', async ({ page }) => {
    await page.goto('/');

    // Check focus indicators on interactive elements
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus');

    // Verify focus indicator styles
    const focusStyles = await focusedElement.evaluate(
      el => getComputedStyle(el).outline
    );

    expect(focusStyles).not.toBe('none');
  });

  test('skip links work correctly', async ({ page }) => {
    await page.goto('/');

    // Press Tab to focus skip link
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('skip-to-main')).toBeFocused();

    // Activate skip link
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('main-content')).toBeFocused();
  });
});
```

## Mobile Testing

### Mobile-Specific Tests

```typescript
// e2e/mobile/mobile-interactions.spec.ts
import { test, expect, devices } from '@playwright/test';

test.use(devices['iPhone 12']);

test.describe('Mobile Interactions', () => {
  test('touch gestures work correctly', async ({ page }) => {
    await page.goto('/games');

    // Test swipe gestures on carousel
    const carousel = page.getByTestId('games-carousel');

    // Get initial position
    const initialCard = await carousel
      .locator('.game-card')
      .first()
      .textContent();

    // Swipe left
    await carousel.swipeLeft();

    // Wait for animation
    await page.waitForTimeout(500);

    // Check if content changed
    const newCard = await carousel.locator('.game-card').first().textContent();
    expect(newCard).not.toBe(initialCard);
  });

  test('pull-to-refresh works', async ({ page }) => {
    await page.goto('/games');

    // Simulate pull-to-refresh gesture
    await page.mouse.move(200, 100);
    await page.mouse.down();
    await page.mouse.move(200, 300);
    await page.mouse.up();

    // Check for refresh indicator
    await expect(page.getByTestId('refresh-indicator')).toBeVisible();
  });

  test('mobile menu works correctly', async ({ page }) => {
    await page.goto('/');

    // Open mobile menu
    await page.getByTestId('mobile-menu-button').tap();
    await expect(page.getByTestId('mobile-nav')).toBeVisible();

    // Navigate using mobile menu
    await page.getByTestId('mobile-games-link').tap();
    await expect(page).toHaveURL('/games');

    // Menu should close after navigation
    await expect(page.getByTestId('mobile-nav')).not.toBeVisible();
  });

  test('viewport adjusts correctly', async ({ page }) => {
    // Test portrait orientation
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const portraitLayout = await page.getByTestId('main-layout').screenshot();

    // Test landscape orientation
    await page.setViewportSize({ width: 812, height: 375 });

    const landscapeLayout = await page.getByTestId('main-layout').screenshot();

    // Layouts should be different
    expect(portraitLayout).not.toEqual(landscapeLayout);
  });
});
```

## API Testing

### API Test Suite

```typescript
// src/__tests__/api/api-endpoints.test.ts
import { testApiEndpoints } from '@/lib/test-utils/api-testing';

describe('API Endpoints', () => {
  const testCases = [
    {
      endpoint: '/api/games',
      method: 'GET',
      requiresAuth: true,
      expectedStatus: 200,
      expectedFields: ['games', 'pagination'],
    },
    {
      endpoint: '/api/games/participate',
      method: 'POST',
      requiresAuth: true,
      payload: { gameId: 'test-game', quantity: 1 },
      expectedStatus: 200,
      expectedFields: ['tickets', 'paymentUrl'],
    },
    {
      endpoint: '/api/users/profile',
      method: 'GET',
      requiresAuth: true,
      expectedStatus: 200,
      expectedFields: ['id', 'email', 'role'],
    },
    {
      endpoint: '/api/tickets/scan',
      method: 'POST',
      requiresAuth: true,
      payload: {
        ticketId: 'test-ticket',
        signature: 'test-signature',
        scannedBy: 'player',
      },
      expectedStatus: 200,
      expectedFields: ['result', 'ticket'],
    },
  ];

  testCases.forEach(
    ({
      endpoint,
      method,
      requiresAuth,
      payload,
      expectedStatus,
      expectedFields,
    }) => {
      it(`${method} ${endpoint} works correctly`, async () => {
        const headers = requiresAuth
          ? { Authorization: 'Bearer test-token' }
          : {};

        const response = await testApiEndpoints(method, endpoint, {
          headers,
          body: payload,
        });

        expect(response.status).toBe(expectedStatus);

        if (expectedFields) {
          expectedFields.forEach(field => {
            expect(response.body.data).toHaveProperty(field);
          });
        }
      });
    }
  );

  describe('Error Handling', () => {
    it('returns proper error format', async () => {
      const response = await testApiEndpoints(
        'GET',
        '/api/nonexistent-endpoint'
      );

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
    });

    it('handles validation errors', async () => {
      const response = await testApiEndpoints(
        'POST',
        '/api/games/participate',
        {
          headers: { Authorization: 'Bearer test-token' },
          body: {
            /* missing required fields */
          },
        }
      );

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
```

## Test Coverage

### Coverage Configuration

```javascript
// jest.config.js - Coverage settings
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/lib/test-utils/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/components/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './src/lib/services/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
```

### Coverage Reporting

```bash
# Generate coverage report
yarn test --coverage

# Generate coverage report with specific threshold
yarn test --coverage --coverageThreshold='{"global":{"branches":90}}'

# Upload coverage to Codecov
bash <(curl -s https://codecov.io/bash)
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Run type checking
        run: yarn type-check

      - name: Run linting
        run: yarn lint

      - name: Run unit tests
        run: yarn test --coverage
        env:
          CI: true

      - name: Run build
        run: yarn build

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: yarn test:e2e

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Build application
        run: yarn build

      - name: Start application
        run: yarn start &

      - name: Wait for server
        run: npx wait-on http://localhost:3000

      - name: Run Lighthouse
        run: node scripts/lighthouse-test.js

      - name: Upload Lighthouse results
        uses: actions/upload-artifact@v3
        with:
          name: lighthouse-results
          path: lighthouse-results/
```

### Test Scripts

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:security": "node scripts/security-tests.js",
    "test:performance": "node scripts/performance-tests.js",
    "test:accessibility": "node scripts/a11y-tests.js",
    "test:all": "yarn test:coverage && yarn test:e2e && yarn test:security"
  }
}
```

## Best Practices

### Test Organization

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **Use Descriptive Names**: Test names should describe what is being tested
3. **Keep Tests Independent**: Each test should be able to run in isolation
4. **Mock External Dependencies**: Use mocks for external APIs and services
5. **Test Edge Cases**: Include tests for error conditions and edge cases

### Performance Testing

1. **Set Performance Budgets**: Define acceptable performance thresholds
2. **Test on Real Devices**: Use real mobile devices for testing
3. **Monitor Core Web Vitals**: Track LCP, FID, and CLS metrics
4. **Load Test Critical Paths**: Focus on user-critical workflows

### Security Testing

1. **Test Authentication**: Verify proper authentication and authorization
2. **Validate Input**: Test input validation and sanitization
3. **Check Rate Limiting**: Ensure rate limiting is working
4. **Test File Uploads**: Validate file upload security

### Accessibility Testing

1. **Use Automated Tools**: Integrate axe-core for automated testing
2. **Test Keyboard Navigation**: Ensure all functionality is keyboard accessible
3. **Check Screen Readers**: Test with actual screen reader software
4. **Verify Color Contrast**: Ensure proper color contrast ratios

---

_This testing guide is continuously updated to reflect best practices and new testing methodologies. Regular updates ensure comprehensive coverage of all application features._
