import '@testing-library/jest-dom';

// Mock fetch for API tests
global.fetch = vi.fn();

// Reset mocks between tests
beforeEach(() => {
  vi.resetAllMocks();
});
