<!--
 * @file NodeInfo.svelte
 * @author James Bennion-Pedley
 * @brief Shows per-node metadata, or global rules when unselected
 * @date 21/12/2023
 *
 * @copyright Copyright (c) 2023
 *
-->

<script lang="ts">
    /*-------------------------------- Imports -------------------------------*/

    import { get } from "svelte/store";

    import tree, { selectedNode, type Tree } from "$lib/stores/tree";

    /*--------------------------------- Props --------------------------------*/

    let dependencies: string[] = [];

    /*-------------------------------- Methods -------------------------------*/

    function getDependencies(t: Tree | null): string[] {
        if (t && t.data) return t.data.dependencies;

        return [];
    }

    /*------------------------------- Lifecycle ------------------------------*/

    selectedNode.subscribe((s) => {
        dependencies = getDependencies(s);
    });

    tree.subscribe((t) => {
        dependencies = getDependencies(get(selectedNode));
    });
</script>

<div class="container">
    {#if $selectedNode !== null}
        <code class="title">{tree.flattenKey($selectedNode)}</code>
        <hr />
        <br />
        <code class="title">Dependencies</code>
        {#each dependencies as d}
            <br />
            <code class="dependency"> - {d}</code>
        {/each}
    {:else}
        <div class="center-container">
            <h5 class="unselected">[No Node Selected]</h5>
        </div>
    {/if}
</div>

<style>
    .container {
        width: 100%;
        height: 100%;
        pointer-events: all;

        padding: 1rem;

        max-height: calc(100vh - 3.8rem - 2.5rem);

        background-color: #1d1d1df1;
    }

    .center-container {
        width: 100%;
        height: 100%;

        display: grid;
        place-items: center;
    }

    .unselected {
        color: var(--color-gray-800);
    }

    .title {
        font-size: 1rem;
        font-weight: bold;
        color: var(--color-secondary-300);
    }

    .dependency {
        margin: 0.2rem;
    }
</style>
