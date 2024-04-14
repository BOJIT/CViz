<!--
 * @file +layout.svelte
 * @author James Bennion-Pedley
 * @brief Root Layout
 * @date 07/02/2023
 *
 * @copyright Copyright (c) 2023
 *
-->

<script lang="ts">
    /*-------------------------------- Imports -------------------------------*/

    import { onMount } from "svelte";

    import "@fontsource/jetbrains-mono";

    import { App, Notification } from "@bojit/svelte-components/core";
    import { mode as themeMode } from "@bojit/svelte-components/theme";
    import { ThemeSelector } from "@bojit/svelte-components/widgets";

    import { themeOverlay } from "$lib/stores/overlays";
    import settings from "$lib/stores/settings";
    import projects from "$lib/stores/projects";
    import events from "$lib/utils/events";

    import palette from "$lib/palette";

    /*--------------------------------- Props --------------------------------*/

    /*-------------------------------- Methods -------------------------------*/

    /* Check browser is supported */
    async function loadCheck(resolve, reject) {
        // If in development deployment, bypass checks
        if (import.meta.env.VITE_BROWSER_CHECK === "false") resolve();

        resolve(); // Note: browser checks not required for Tauri build
    }

    /*------------------------------- Lifecycle ------------------------------*/

    onMount(async () => {
        // Set up listeners for Tauri events
        await events.init();

        // Initialise local storage databases
        await settings.init();
        await projects.init();

        // Update settings store when theme changes
        $themeMode = $settings.theme;
        themeMode.subscribe((t) => {
            $settings.theme = t;
        });
    });
</script>

<App theme={palette} load={loadCheck}>
    <slot />
</App>

<ThemeSelector bind:active={$themeOverlay} />
<Notification />
