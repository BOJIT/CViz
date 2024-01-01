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
    import TreeButtonGroup from "$lib/components/TreeButtonGroup.svelte";

    import tree, { selectedNode, type NestedTree } from "$lib/stores/tree";

    import { Document } from "@svicons/ionicons-outline";
    import config from "$lib/stores/config";

    /*--------------------------------- Types --------------------------------*/

    type TreeViewEntry = {
        text: string;
        path?: string;
        items?: TreeViewEntry[];
    };

    /*--------------------------------- Props --------------------------------*/

    /*-------------------------------- Methods -------------------------------*/

    function pushTreeEntry(
        tv: TreeViewEntry[],
        t: NestedTree,
        currentPath: string = "",
    ) {
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
                    let path =
                        currentPath === "" ? n[0] : `${currentPath}/${n[0]}`;
                    const entry: TreeViewEntry = {
                        text: n[0],
                        path: path,
                    };
                    const items = pushTreeEntry([], n[1], path);
                    if (items.length > 0) entry.items = items;

                    tv.push(entry);
                });
        }

        return tv;
    }

    /*------------------------------- Lifecycle ------------------------------*/
</script>

<div class="container">
    <TreeView
        items={pushTreeEntry([], $tree)}
        dense
        let:item
        on:select={(e) => {
            let key = e.detail.path;
            let ft = tree.flatten($tree);
            if (key in ft) $selectedNode = key;
        }}
    >
        <span class="tree-entry">
            {#if !item.items}
                <Document height="1rem" />
            {/if}
            {item.text}
            {#if item.items}
                <TreeButtonGroup
                    include={$config.includeRoots?.includes(item.path)}
                    ignore={$config.ignoreList?.includes(item.path)}
                    on:include={(e) => {
                        config.update((c) => {
                            if (e.detail === true) {
                                c.includeRoots?.push(item.path);
                            } else {
                                if (c.includeRoots) {
                                    c.includeRoots = c.includeRoots.filter(
                                        (i) => i !== item.path,
                                    );
                                }
                            }

                            return c;
                        });
                    }}
                    on:ignore={(e) => {
                        config.update((c) => {
                            if (e.detail === true) {
                                c.ignoreList?.push(item.path);
                            } else {
                                if (c.ignoreList) {
                                    c.ignoreList = c.ignoreList.filter(
                                        (i) => i !== item.path,
                                    );
                                }
                            }

                            return c;
                        });
                    }}
                />
            {/if}
        </span>
    </TreeView>
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

    .tree-entry {
        display: flex;
        gap: 0.6rem;

        align-items: center;
        justify-content: center;
        font-family: var(--font-monospace);
    }
</style>
