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

    import { activeProject } from "$lib/stores/projects";

    import NodeInfo from "$lib/components/NodeInfo.svelte";
    import SourceTree from "$lib/components/SourceTree.svelte";

    /*--------------------------------- Props --------------------------------*/

    /*-------------------------------- Methods -------------------------------*/

    /*------------------------------- Lifecycle ------------------------------*/
</script>

{#if $activeProject !== null}
    <div class="panes">
        <Splitpanes>
            <Pane snapSize={10} size={30} maxSize={40}>
                <SourceTree />
            </Pane>

            <Pane minSize={30} />

            <Pane snapSize={10} size={30} maxSize={40}>
                <NodeInfo />
            </Pane>
        </Splitpanes>
    </div>
{/if}

<style>
    .panes :global(.splitpanes__pane) {
        background-color: transparent !important;

        pointer-events: none;
    }

    .panes :global(.splitpanes__splitter) {
        background-color: #525252 !important;
        border-left: #646464 !important;
        border-top: #646464 !important;

        pointer-events: all;
    }

    .panes {
        pointer-events: none;
        height: 100%;

        position: relative;
        display: grid;
        place-items: center;
    }
</style>
