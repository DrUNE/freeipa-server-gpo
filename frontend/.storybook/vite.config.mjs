import { defineConfig } from 'vite';
import { alias } from './shared.mjs';

// Used by Storybook instead of ../vite.config.mjs, which serves the dev stand and builds the bundle.
export default defineConfig({ resolve: { alias } });
