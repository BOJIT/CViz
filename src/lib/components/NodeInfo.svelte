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

    import { selectedNode, type NestedTree } from "$lib/stores/tree";

    import tree from "$lib/stores/tree";

    /*--------------------------------- Props --------------------------------*/

    let dependencies: string[] = [];

    /*-------------------------------- Methods -------------------------------*/

    function getDependencies(t: NestedTree, key: string | null): string[] {
        if (key === null) return [];

        let ft = tree.flatten(t);
        if (!(key in ft)) return [];

        return ft[key].dependencies;
    }

    /*------------------------------- Lifecycle ------------------------------*/

    selectedNode.subscribe((s) => {
        if (!s) {
            dependencies = [];
            return;
        }

        dependencies = getDependencies(get(tree), s);
    });

    tree.subscribe((t) => {
        dependencies = getDependencies(t, get(selectedNode));
    });
</script>

<div class="container">
    {#if $selectedNode}
        <code class="title">{$selectedNode}</code>
        <hr />
        <br />
        <code class="title">Dependencies</code>
        {#each dependencies as d}
            <br />
            <code class="dependency"> - {d}</code>
        {/each}
    {:else}
        <h5 class="unselected">[No Node Selected]</h5>
    {/if}
</div>

<style>
    .container {
        width: 100%;
        height: 100%;
        pointer-events: all;

        padding: 1rem;

        /* display: grid;
        place-items: center; */

        background-color: #1d1d1df1;
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
