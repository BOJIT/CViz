<!--
 * @file StatusBar.svelte
 * @author James Bennion-Pedley
 * @brief Bottom Status Ticker
 * @date 14/04/2024
 *
 * @copyright Copyright (c) 2024
 *
-->

<script lang="ts">
    /*-------------------------------- Imports -------------------------------*/

    import project, { activeProject } from "$lib/stores/projects";
    import tree, { selectedNode } from "$lib/stores/tree";

    /*--------------------------------- Props --------------------------------*/

    /*-------------------------------- Methods -------------------------------*/

    /*------------------------------- Lifecycle ------------------------------*/
</script>

{#if $activeProject !== null}
    <div class="statusbar">
        <h5 class="status-text">
            {#if $selectedNode !== null}
                {$project[$activeProject].shortName}<span class="project-prefix"
                    >/{tree.flattenKey($selectedNode)}</span
                >
            {:else}
                {$project[$activeProject].shortName}
            {/if}
        </h5>
    </div>
{/if}

<style>
    .statusbar {
        position: fixed;
        bottom: 0px;
        left: 0px;

        height: 2.5rem;
        width: 100vw;
        background-color: var(--color-primary-800);
    }

    .status-text {
        padding: 0.5rem;
        font-family: var(--font-monospace);
        font-size: 1rem;
    }

    .project-prefix {
        color: var(--color-alert-200);
        white-space: nowrap;
    }
</style>
