import { defineConfig } from 'win';

export default defineConfig({
  plugins: ['../src'],
  security: {
    // sri: true,
    sri: {
      // algorithm: 'sha256',
      // algorithm: 'sha384',
    },
  },
});
