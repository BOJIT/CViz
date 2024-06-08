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

    tree.subscribe((t) => {
        console.log(t);
    });
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
                // See if we need to update anything
                console.log(e.detail);
            }}
        />
    {/if}
</div>

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
