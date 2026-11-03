import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset URLs work at /, /GlobeUX/, and a custom static-host prefix.
  base: './',
  resolve: { dedupe: ['three'] },
});
