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

    import { Treeview } from "@bojit/svelte-components/smelte";

    import tree, { type NestedTree } from "$lib/stores/tree";

    /*--------------------------------- Types --------------------------------*/

    type TreeViewEntry = {
        text: string;
        items?: TreeViewEntry[];
    };

    /*--------------------------------- Props --------------------------------*/

    /*-------------------------------- Methods -------------------------------*/

    function pushTreeEntry(tv: TreeViewEntry[], t: NestedTree) {
        if (t.items) {
            Object.entries(t.items)
                .sort((a: [string, NestedTree], b: [string, NestedTree]) => {
                    // Directories first
                    if (a[1].items && !b[1].items) return -1;
                    if (b[1].items && !a[1].items) return 1;

                    // Alphabetical compare
                    if (a[0] < b[0]) return -1;
                    if (a[0] > b[0]) return 1;

                    return 0;
                })
                .forEach((n) => {
                    const entry: TreeViewEntry = { text: n[0] };
                    const items = pushTreeEntry([], n[1]);
                    if (items.length > 0) entry.items = items;

                    tv.push(entry);
                });
        }

        return tv;
    }

    /*------------------------------- Lifecycle ------------------------------*/
</script>

<div class="container">
    <Treeview items={pushTreeEntry([], $tree)} />
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
