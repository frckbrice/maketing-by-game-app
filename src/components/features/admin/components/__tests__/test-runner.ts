// Test runner for admin components
// This file can be used to run specific test suites or all tests

import { runTests } from '@jest/core';

// Test configuration
const testConfig = {
  testPathPattern: 'src/components/features/admin/components/__tests__/',
  verbose: true,
  coverage: true,
  watch: false,
};

// Run all admin component tests
export async function runAdminTests() {
  try {
    console.log('🚀 Starting admin component tests...');

    // Run tests with configuration
    const results = await runTests(testConfig);

    console.log('✅ Admin component tests completed!');
    console.log('📊 Test Results:', results);

    return results;
  } catch (error) {
    console.error('❌ Error running admin component tests:', error);
    throw error;
  }
}

// Run specific test suite
export async function runTestSuite(suiteName: string) {
  try {
    console.log(`🚀 Starting ${suiteName} tests...`);

    const specificConfig = {
      ...testConfig,
      testNamePattern: suiteName,
    };

    const results = await runTests(specificConfig);

    console.log(`✅ ${suiteName} tests completed!`);
    return results;
  } catch (error) {
    console.error(`❌ Error running ${suiteName} tests:`, error);
    throw error;
  }
}

// Export test utilities
export const testUtils = {
  mockAuthContext: (user: any, loading = false) => ({
    user,
    loading,
    firebaseUser: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    signInWithGoogle: jest.fn(),
    sendPhoneVerificationCode: jest.fn(),
    verifyPhoneCode: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    updatePassword: jest.fn(),
    updateProfile: jest.fn(),
    deleteAccount: jest.fn(),
  }),

  mockRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),

  mockTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),

  createMockUser: (role: 'ADMIN' | 'USER' | 'VENDOR' = 'ADMIN') => ({
    id: '1',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
};

// Default export
export default {
  runAdminTests,
  runTestSuite,
  testUtils,
};
