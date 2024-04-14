import adapter from '@sveltejs/adapter-static';
import { mdsvex } from "mdsvex";
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    extensions: [".svelte", ".svelte.md"],
    preprocess: [
        mdsvex({
            extensions: [".svelte.md"],
        }),
        vitePreprocess(),
    ],
    kit: {
        adapter: adapter({
            strict: false,
        }),
    }
};

export default config;
