<!--
 * @file TreeView.svelte
 * @author James Bennion-Pedley
 * @brief Tree-view rendering of Tree data site
 * @date 02/01/2024
 *
 * @copyright Copyright (c) 2024
 *
-->

<script lang="ts">
    /*-------------------------------- Imports -------------------------------*/

    import { createEventDispatcher } from "svelte";
    import { slide } from "svelte/transition";

    import { Icon, List, ListItem } from "@bojit/svelte-components/smelte";

    import { Document } from "@svicons/ionicons-outline";

    import type { Tree } from "$lib/stores/tree";

    import TreeButtonGroup from "$lib/components/TreeButtonGroup.svelte";

    /*--------------------------------- Props --------------------------------*/

    export let name: string;
    export let tree: Tree;

    const selectedClasses = "bg-primary-trans";
    const dispatch = createEventDispatcher();

    /*-------------------------------- Methods -------------------------------*/

    function getKeysInOrder(nodes: { [key: string]: Tree }): string[] {
        return Object.entries(nodes)
            .sort((a: [string, Tree], b: [string, Tree]) => {
                // Directories first
                if (a[1].nodes && !b[1].nodes) return -1;
                if (b[1].nodes && !a[1].nodes) return 1;

                // Alphabetical compare
                if (a[0] < b[0]) return -1;
                if (a[0] > b[0]) return 1;

                return 0;
            })
            .map((e) => e[0]);
    }

    /*------------------------------- Lifecycle ------------------------------*/
</script>

<ListItem
    useRipple={false}
    {selectedClasses}
    on:click={() => {
        if (tree.nodes) {
            // For 'folder' nodes
            tree.ui.expanded = !tree.ui.expanded;
            tree = tree;
            dispatch("change", tree);
        }
        dispatch("select", tree);
    }}
>
    <div class="flex items-center tree-entry">
        {#if tree.nodes}
            <Icon tip={tree.ui.expanded}>arrow_right</Icon>
        {:else}
            <Document height="18px" />
        {/if}
        {name}
        {#if tree.nodes}
            <TreeButtonGroup
                bind:include={tree.ui.include}
                bind:ignore={tree.ui.ignore}
                bind:colour={tree.ui.groupColour}
                on:change={() => {
                    dispatch("change", tree);
                }}
            />
        {/if}
    </div>
</ListItem>

{#if tree.ui.expanded && tree.nodes}
    <div in:slide class="ml-6">
        <List items={getKeysInOrder(tree.nodes)}>
            <span slot="item" let:item>
                <svelte:self
                    name={item}
                    tree={tree.nodes[item]}
                    on:select
                    on:change
                />
            </span>
        </List>
    </div>
{/if}

<style>
    .flex :global(li) {
        overflow: visible !important;
    }

    .tree-entry {
        display: flex;
        gap: 0.6rem;

        align-items: center;
        justify-content: center;
        font-family: var(--font-monospace);
    }
</style>
