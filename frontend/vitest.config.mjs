import { defineConfig } from 'vitest/config';

// Three projects; `npm test` runs unit + integration (mocks only),
// `npm run test:ipa` runs e2e against a live FreeIPA server.
export default defineConfig({
    test: {
        // Browser tests are timing-sensitive on small CI runners: one retry there, none locally.
        retry: process.env.CI ? 1 : 0,
        // `npm test -- --coverage`. Only unit tests contribute: integration tests execute the code
        // inside Chromium, which Node's V8 coverage does not see. The thresholds are a floor at the
        // current level (ratchet them up as unit coverage grows), not a target.
        coverage: {
            provider: 'v8',
            include: ['src/**/*.js'],
            reporter: ['text-summary', 'html'],
            thresholds: { statements: 16, branches: 16, functions: 21, lines: 18 }
        },
        projects: [
            { test: { name: 'unit', include: ['tests/unit/**/*.test.js'] } },
            {
                test: {
                    name: 'integration',
                    include: ['tests/integration/**/*.test.js'],
                    // Each file launches Chromium, which spawns many processes; unbounded parallelism
                    // exhausts container pid limits (podman defaults to 2048).
                    maxWorkers: 2,
                    // Projects with different worker limits must run in different groups.
                    sequence: { groupOrder: 1 },
                    testTimeout: 60000,
                    hookTimeout: 60000
                }
            },
            {
                test: {
                    name: 'e2e',
                    include: ['tests/e2e/**/*.test.js'],
                    testTimeout: 90000,
                    hookTimeout: 90000,
                    fileParallelism: false,
                    sequence: { groupOrder: 2 }
                }
            }
        ]
    }
});
