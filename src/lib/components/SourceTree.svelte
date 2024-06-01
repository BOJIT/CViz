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

    import tree, { type Tree } from "$lib/stores/tree";

    /*--------------------------------- Types --------------------------------*/

    // interface TreeViewEntry extends TreeViewItem {
    //     path?: string;
    //     ref?: Tree;
    // }

    /*--------------------------------- Props --------------------------------*/

    /*-------------------------------- Methods -------------------------------*/

    function pushTreeEntry(
        t: Tree,
        currentPath: string = "",
        tv: TreeViewEntry[] = [],
    ) {
        if (t.items) {
            Object.entries(t.items)
                .sort((a: [string, Tree], b: [string, Tree]) => {
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
                        ref: n[1], // Pass reference to original treeview
                        expanded: !!n[1].data?.ui?.expanded,
                    };
                    const items = pushTreeEntry(n[1], path);
                    if (items.length > 0) entry.items = items;

                    tv.push(entry);
                });
        }

        return tv;
    }

    // function handleSelect(i: TreeViewEntry) {
    //     // Write back UI data to Tree
    //     if (i.ref) {
    //         // Create intermediate objects if they don't exist
    //         i.ref.data = i.ref.data || {};
    //         i.ref.data.ui = i.ref.data.ui || {};

    //         i.ref.data.ui.expanded = i.expanded; // This doesn't need to trigger a tree store assignment
    //     }

    //     let key = i.path;
    //     let ft = tree.flatten($tree);

    //     if (key && key in ft) $selectedNode = key;
    // }

    /*------------------------------- Lifecycle ------------------------------*/
    tree.subscribe((t) => {
        console.log(t);
    });
</script>

<div class="container">
    {#if $tree.nodes}
        <TreeView
            nodes={$tree.nodes}
            on:select={(e) => {
                console.log(e.detail);
                // handleSelect(e.detail);
            }}
        />
        <!-- <span class="tree-entry">
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
            </span> -->
    {/if}
</div>

<style>
    .container {
        width: 100%;
        height: 100%;
        pointer-events: all;

        background-color: #1d1d1df1;

        max-height: calc(100vh - 3.8rem);
        overflow: scroll;
    }
</style>
