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

    import "@fontsource/jetbrains-mono";

    import { App, Notification } from "@bojit/svelte-components/core";
    import { palette, mode as themeMode } from "@bojit/svelte-components/theme";
    import { ThemeSelector } from "@bojit/svelte-components/widgets";

    import { themeOverlay } from "$lib/stores/overlays";
    import settings from "$lib/stores/settings";
    import { onMount } from "svelte";

    /*--------------------------------- Props --------------------------------*/

    /*-------------------------------- Methods -------------------------------*/

    /* Check browser is supported */
    async function loadCheck(resolve, reject) {
        // If in development deployment, bypass checks
        if (import.meta.env.VITE_BROWSER_CHECK === "false") resolve();

        // Check browser compatibility
        if ("showDirectoryPicker" in window) {
            resolve();
        } else {
            reject("Filesystem Access API not supported in your browser!");
        }
    }

    /*------------------------------- Lifecycle ------------------------------*/

    onMount(async () => {
        // Initialise local storage databases
        await settings.init();

        // Update settings store when theme changes
        $themeMode = $settings.theme;
        themeMode.subscribe((t) => {
            $settings.theme = t;
        });
    });
</script>

<App theme={palette.midnight} load={loadCheck}>
    <slot />
</App>

<ThemeSelector bind:active={$themeOverlay} />
<Notification />