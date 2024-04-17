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

    export let items: [string, Tree][];
    export let level = 0;

    export let selected: Tree | null = null;

    const selectedClasses = "bg-primary-trans";
    const expandIcon = "arrow_right";
    const dispatch = createEventDispatcher();

    /*-------------------------------- Methods -------------------------------*/

    function toggle(t: Tree) {
        console.log(t);
        // For 'files'
        if (!t.items) {
            selected = t;
        } else {
            // For 'folders'
            if (t.ui) {
                t.ui.expanded = !t.ui.expanded;
                t = t;
            }
        }

        dispatch("select", t);
    }

    // These functions are purely here for typing hints
    function getKey(entry: [string, Tree]): string {
        return entry[0];
    }

    function getValue(entry: [string, Tree]): Tree {
        return entry[1];
    }

    /*------------------------------- Lifecycle ------------------------------*/
</script>

<List {items} {...$$props}>
    <span slot="item" let:item>
        <!-- Regain typing -->
        {@const k = getKey(item)}
        {@const n = getValue(item)}

        <ListItem
            useRipple={false}
            {...$$props}
            {selectedClasses}
            selected={selected === k}
            on:click={() => toggle(n)}
        >
            <div class="flex items-center tree-entry">
                {#if n.items}
                    <Icon tip={n.ui?.expanded ? true : false}>
                        {expandIcon}
                    </Icon>
                {/if}
                {#if n.data}
                    <Document height="1rem" />
                {/if}
                {k}
                {#if n.items}
                    <TreeButtonGroup />
                {/if}
            </div>
        </ListItem>

        {#if n.items && n.ui?.expanded}
            <div in:slide class="ml-6">
                <svelte:self
                    items={Object.entries(n.items)}
                    {...$$props}
                    level={level + 1}
                    let:item
                    on:click
                    on:select
                >
                    <slot {item} />
                </svelte:self>
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
