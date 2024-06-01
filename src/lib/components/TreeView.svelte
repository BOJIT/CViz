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

    export let nodes: {
        [key: string]: Tree;
    };
    export let level = 0;
    export let selected: Tree | null = null;

    const selectedClasses = "bg-primary-trans";
    const dispatch = createEventDispatcher();

    /*-------------------------------- Methods -------------------------------*/

    /*------------------------------- Lifecycle ------------------------------*/
</script>

<!-- TODO don't use List, just use ListItem -->

<List items={Object.entries(nodes)} {...$$props}>
    <span slot="item" let:item>
        <ListItem
            {...$$props}
            {selectedClasses}
            useRipple={false}
            selected={selected === item[1]}
            on:click={() => {
                if (item[1].data) {
                    // For 'file' nodes
                    selected = item[1];
                } else {
                    // For 'folder' nodes
                    item[1].ui.expanded = !item[1].ui.expanded;
                }
                item[1] = item[1];
                dispatch("select", item[1]);
            }}
        >
            <div class="flex items-center tree-entry">
                {#if item[1].nodes}
                    <Icon tip={item[1].ui.expanded}>arrow_right</Icon>
                {:else}
                    <Document height="1rem" />
                {/if}
                {item[0]}
                {#if item[1].nodes}
                    <TreeButtonGroup />
                {/if}
            </div>
        </ListItem>

        {#if item[1].nodes && item[1].ui.expanded}
            <div in:slide class="ml-6">
                <svelte:self
                    nodes={item[1].nodes}
                    level={level + 1}
                    {...$$props}
                    on:click
                    on:select
                />
            </div>
        {/if}
    </span>
</List>

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
