<!--
 * @file SourceTree.svelte
 * @author James Bennion-Pedley
 * @brief Tree-structure for source file navigation
 * @date 21/12/2023
 *
 * @copyright Copyright (c) 2023
 *
-->

<script lang="ts">
    /*-------------------------------- Imports -------------------------------*/

    import tree, { type TreeStore } from "$lib/stores/tree";

    import { activeProject } from "$lib/stores/projects";

    /*--------------------------------- Props --------------------------------*/

    /*-------------------------------- Methods -------------------------------*/

    function treeToSourceList(t: TreeStore) {
        return Object.entries(t)
            .map((n) => n[0].slice($activeProject?.length))
            .sort();
    }

    /*------------------------------- Lifecycle ------------------------------*/
</script>

<div class="container">
    {#each treeToSourceList($tree) as t}
        <p>{t}</p>
    {/each}
</div>

<style>
    .container {
        width: 100%;
        height: 100%;
        pointer-events: all;

        background-color: #1d1d1df1;

        max-height: calc(94vh - 3.8rem);
        overflow: scroll;
    }

    p {
        font-family: var(--font-monospace);
        font-size: 1rem;
        text-align: left;
    }
</style>
