// playwright.config.ts

import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    testDir: '__tests__/e2e_tests', // Or wherever your tests are located
    //   testMatch: '**/*.test.{ts}', // Add 'tsx' here
    testMatch: '**/*.test.{ts,tsx}', // Add 'tsx' here
    // Add any other configuration options you need
};

export default config;
