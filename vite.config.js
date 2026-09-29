import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const RECHARTS_PACKAGES = [
  'recharts',
  'recharts-scale',
  'victory-vendor',
  'react-smooth',
  'react-transition-group',
  'react-is',
  'internmap',
  'decimal.js'
];

const REACT_PACKAGES = ['react', 'react-dom', 'scheduler'];

function matchPackage(normalizedId, packages) {
  return packages.some(
    (name) =>
      normalizedId.includes(`node_modules/${name}/`) ||
      normalizedId.endsWith(`node_modules/${name}`)
  );
}

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.split('\\').join('/');

          if (!normalizedId.includes('node_modules')) return undefined;

          if (
            matchPackage(normalizedId, RECHARTS_PACKAGES) ||
            normalizedId.includes('node_modules/d3-')
          ) {
            return 'recharts-vendor';
          }

          if (normalizedId.includes('@supabase')) return 'supabase-vendor';

          if (matchPackage(normalizedId, REACT_PACKAGES)) return 'react-vendor';

          return 'vendor';
        }
      }
    }
  }
});
