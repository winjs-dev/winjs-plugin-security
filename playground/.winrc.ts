import { defineConfig } from 'win';

export default defineConfig({
  plugins: ['../src'],
  security: {
    sri: true,
  },
});
