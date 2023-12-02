<!--
 * @file GraphOverlay.svelte
 * @author James Bennion-Pedley
 * @brief UI that exists above the central graph view
 * @date 02/12/2023
 *
 * @copyright Copyright (c) 2023
 *
-->

<script lang="ts">
    /*-------------------------------- Imports -------------------------------*/

    import project, { activeProject } from "$lib/stores/projects";

    /*--------------------------------- Props --------------------------------*/

    /*-------------------------------- Methods -------------------------------*/

    /*------------------------------- Lifecycle ------------------------------*/
</script>

<div class="container">
    {#if $activeProject !== null}
        <h2>{$project[$activeProject].shortName}</h2>
    {/if}
</div>

<style>
    .container {
        height: 100%;

        display: grid;
        place-items: center;
    }
</style>
