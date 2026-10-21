export default {
    stories: ['../src/**/*.stories.js'],
    addons: ['@storybook/addon-vitest', '@storybook/addon-a11y', '@storybook/addon-docs'],
    framework: {
        name: '@storybook/html-vite',
        options: { builder: { viteConfigPath: '.storybook/vite.config.mjs' } }
    },
    core: { disableTelemetry: true }
};
