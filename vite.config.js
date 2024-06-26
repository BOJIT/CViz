import git from "git-rev-sync";

import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";

process.env.VITE_GIT_HASH = git.short("./", 7);

export default defineConfig(async () => ({
    plugins: [sveltekit()],

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
        port: 1420,
        strictPort: true,
        watch: {
            // 3. tell vite to ignore watching `src-tauri`
            ignored: ["**/src-tauri/**"],
        },
    },
}));
