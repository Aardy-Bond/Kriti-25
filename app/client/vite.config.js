import { defineConfig } from 'vite';
import {nodePolyfills} from 'vite-plugin-node-polyfills';
import react from '@vitejs/plugin-react'

export default defineConfig({
  build:{
    rollupOptions: {
      external: ['@web3modal/wagmi/react'], // Add the module here
    },
  },
  plugins: [nodePolyfills({protocolImports: true}) , react()],
  resolve: {
    alias: {
      stream: 'stream-browserify',
      buffer: 'buffer',
    },
  },
});