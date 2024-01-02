<!--
 * @file TreeView.svelte
 * @author James Bennion-Pedley
 * @brief Genericised Tree-view component
 * @date 02/01/2024
 *
 * @copyright Copyright (c) 2024
 *
-->

<script lang="ts" context="module">
    /*--------------------------------- Types --------------------------------*/

    export interface TreeViewItem {
        text: string;
        expanded?: boolean;
        items?: TreeViewItem[];
    }
</script>

<script lang="ts">
    // NOTE this file is modified from the Smelte library version

    /*-------------------------------- Imports -------------------------------*/

    import { Icon, List, ListItem } from "@bojit/svelte-components/smelte";

    import { createEventDispatcher } from "svelte";
    import { slide } from "svelte/transition";

    /*--------------------------------- Props --------------------------------*/

    export let items: TreeViewItem[] = [];
    export const value = "";
    export const text = "";
    export const dense: boolean = false;
    export const navigation = false;
    export const select = false;
    export let level = 0;
    export let showExpandIcon = true;
    export let expandIcon = "arrow_right";
    export let selectable = true;
    export let selected: TreeViewItem | null = null;
    export let selectedClasses = "bg-primary-trans";

    const dispatch = createEventDispatcher();

    let refreshExpansion = false; // Horrendous hack

    /*-------------------------------- Methods -------------------------------*/

    function toggle(i: TreeViewItem) {
        // For 'files'
        if (selectable && !i.items) {
            selected = i;
        } else {
            // For 'folders'
            i.expanded = !i.expanded;
            refreshExpansion = !refreshExpansion;
        }

        dispatch("select", i);
    }

    /*------------------------------- Lifecycle ------------------------------*/
</script>

<List {items} {...$$props}>
    <span slot="item" let:item>
        <ListItem
            useRipple={false}
            {item}
            {...$$props}
            {...item}
            selected={selectable && selected === item}
            {selectedClasses}
            on:click={() => toggle(item)}
        >
            <div class="flex items-center">
                {#if showExpandIcon && !item.hideArrow && item.items}
                    <Icon
                        tip={item.expanded
                            ? item.expanded
                            : false && refreshExpansion}>{expandIcon}</Icon
                    >
                {/if}
                <slot {item} {refreshExpansion}><span>{item.text}</span></slot>
            </div>
        </ListItem>

        {#if item.items && item.expanded}
            <div in:slide class="ml-6">
                <svelte:self
                    {...$$props}
                    items={item.items}
                    level={level + 1}
                    let:item
                    on:click
                    on:select
                >
                    <slot {item} {refreshExpansion} />
                </svelte:self>
            </div>
        {/if}
    </span>
</List>

<style>
    .flex :global(li) {
        overflow: visible !important;
    }
</style>
