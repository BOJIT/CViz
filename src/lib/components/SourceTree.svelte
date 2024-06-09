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

    import TreeView from "$lib/components/TreeView.svelte";

    import tree, { selectedNode } from "$lib/stores/tree";

    import project, { activeProject } from "$lib/stores/projects";

    // Use project name as workspace root for now

    /*--------------------------------- Props --------------------------------*/

    /*-------------------------------- Methods -------------------------------*/

    /*------------------------------- Lifecycle ------------------------------*/
</script>

<div class="container">
    {#if $activeProject}
        <TreeView
            name={$project[$activeProject].shortName}
            tree={$tree}
            on:select={(e) => {
                $selectedNode = e.detail;
            }}
            on:change={(e) => {
                tree.handlePartialUpdate(e.detail);
            }}
        />
    {/if}
</div>

<style>
    .container {
        width: 100%;
        height: 100%;
        pointer-events: all;

        background-color: #1d1d1df1;

        max-height: calc(100vh - 3.8rem - 2.5rem);
        overflow: scroll;
    }
</style>
