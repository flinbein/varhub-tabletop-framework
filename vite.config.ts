import type { UserConfig } from 'vite';
import dts from "vite-plugin-dts";

export default {
    root: "./",
    base: "./",
    build: {
        lib: {
            // Could also be a dictionary or array of multiple entry points
            entry: './src/index.ts',
            name: 'VarhubUIKit',
            // the proper extensions will be added
            fileName: 'index',
            formats: ["es", "cjs"]
        },
        target: "es2020",
        outDir: "./dist",
        emptyOutDir: true,
    },
    plugins: [
        dts({
            insertTypesEntry: true,
            outDir: "./dist/types",
            include: "./src/**/*.(ts|tsx|js|jsx)",
            // tsconfigPath: "./tsconfig.types.json",
            rollupTypes: true,
            exclude: "./src/example/**/*",
            // rollupTypes: true,
        }),
    ]
} satisfies UserConfig

//
// // https://vitejs.dev/config/
// export default (opts: { mode: "production" | "development"; command: "build" | "serve" }) => {
//     return defineConfig({
//         build: {
//             target: "es2020",
//             commonjsOptions: {
//                 sourceMap: false
//             },
//             rollupOptions: {
//                 input: {
//                     index: "./src/index.js"
//                 },
//                 /* single
//                 output: {
//                     format: "umd",
//                     strict: false,
//                     chunkFileNames: `[name].[hash].js`,
//                     entryFileNames: "[name].bundle.umd.js",
//                     dir: "dist"
//                 },
//                 */
//                 // array config example
//                 // from rollup: export type InternalModuleFormat = 'amd' | 'cjs' | 'es' | 'iife' | 'system' | 'umd';
//                 output: [
//                     {
//                         format: 'cjs',
//                         entryFileNames: "[name].bundle.[format].js",
//                     },
//                     {
//                         format: 'es',
//                         entryFileNames: "[name].bundle.[format].js",
//                     },
//                     {
//                         format: 'umd',
//                         entryFileNames: "[name].bundle.[format].js",
//                     },
//                 ]
//             }
//         }
//     });
// };
