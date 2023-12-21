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

    import SourceTree from "$lib/components/SourceTree.svelte";

    /*--------------------------------- Props --------------------------------*/

    /*-------------------------------- Methods -------------------------------*/

    /*------------------------------- Lifecycle ------------------------------*/
</script>

<div class="container">
    <Splitpanes class="default-theme" style="height: 400px">
        <Pane minSize={20}>I have a min width of 20%</Pane>
        <Pane>
            <Splitpanes class="default-theme" horizontal={true}>
                <Pane minSize={15}>I have a min height of 15%</Pane>
                <Pane>Try double clicking the splitters</Pane>
                <Pane snapSize={10}>With a bottom snap of 10</Pane>
            </Splitpanes>
        </Pane>
        <Pane>Right Panel</Pane>
    </Splitpanes>

    {#if $activeProject !== null}
        <div class="side-panel">
            <SourceTree />
        </div>

        <h2>{$project[$activeProject].shortName}</h2>
    {/if}
</div>

<style>
    .container {
        height: 100%;

        position: relative;
        display: grid;
        place-items: center;

        /* TODO remove eventually */
        pointer-events: none;
    }

    .side-panel {
        position: absolute;
        top: 0px;
        left: 0px;

        height: 100%;
    }
</style>
