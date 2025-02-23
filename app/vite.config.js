import cesium from 'vite-plugin-cesium';
export default {
  plugins: [cesium()],
  build: {
    sourcemap: true,
    emptyOutDir: true,
    outDir: "../dist",
  },
  publicDir: "./assets",
};
