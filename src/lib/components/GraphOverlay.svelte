<!--
 * @file GraphOverlay.svelte
 * @author James Bennion-Pedley
 * @brief UI that exists above the central graph view
 * @date 02/12/2023
 *
 * @copyright Copyright (c) 2023
 *
-->

<script lang="ts">
    /*-------------------------------- Imports -------------------------------*/

    import { Pane, Splitpanes } from "svelte-splitpanes";

    import project, { activeProject } from "$lib/stores/projects";

    import NodeInfo from "$lib/components/NodeInfo.svelte";
    import SourceTree from "$lib/components/SourceTree.svelte";

    /*--------------------------------- Props --------------------------------*/

    /*-------------------------------- Methods -------------------------------*/

    /*------------------------------- Lifecycle ------------------------------*/
</script>

{#if $activeProject !== null}
    <div class="panes">
        <Splitpanes horizontal theme="no-splitter">
            <Pane>
                <Splitpanes>
                    <Pane snapSize={10} size={30}>
                        <SourceTree />
                    </Pane>

                    <Pane>
                        <div class="graph-window">
                            <h2>{$project[$activeProject].shortName}</h2>
                        </div>
                    </Pane>

                    <Pane snapSize={10} size={30}>
                        <NodeInfo />
                    </Pane>
                </Splitpanes>
            </Pane>

            <Pane size={6} minSize={6} maxSize={6}>Statusbar</Pane>
        </Splitpanes>
    </div>
{/if}

<style>
    .panes :global(.splitpanes__pane) {
        background-color: transparent !important;
    }

    .panes :global(.splitpanes__splitter) {
        background-color: #525252 !important;
        border-left: #646464 !important;
        border-top: #646464 !important;
    }

    .panes {
        height: 100%;

        position: relative;
        display: grid;
        place-items: center;
    }

    .graph-window {
        height: 100%;

        position: relative;
        display: grid;
        place-items: center;
    }
</style>
