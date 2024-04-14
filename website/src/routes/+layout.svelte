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

    import { App } from "@bojit/svelte-components/core";

    import palette from "$lib/palette";

    /*--------------------------------- Props --------------------------------*/

    /*-------------------------------- Methods -------------------------------*/

    /* Check browser is supported */
    async function loadCheck(resolve, reject) {
        // If in development deployment, bypass checks
        if (import.meta.env.VITE_BROWSER_CHECK === "false") resolve();

        resolve();
    }

    /*------------------------------- Lifecycle ------------------------------*/
</script>

<App theme={palette} load={loadCheck}>
    <slot />
</App>
