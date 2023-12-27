<!--
 * @file GraphView.svelte
 * @author James Bennion-Pedley
 * @brief Brief summary here
 * @date 26/11/2023
 *
 * @copyright Copyright (c) 2023
 *
-->

<script context="module" lang="ts">
    /*--------------------------------- Types --------------------------------*/

    interface Node extends SimulationNodeDatum {
        id: string;
        group: number;
    }

    interface Link extends SimulationLinkDatum<Node> {
        source: string;
        target: string;
        value: number;
    }

    export { type Node, type Link };
</script>

<script lang="ts">
    /*-------------------------------- Imports -------------------------------*/

    import { onMount } from "svelte";

    import type { SimulationNodeDatum, SimulationLinkDatum } from "d3-force";

    import ForceGraph, {
        type ForceGraphInstance,
        type GraphData,
        type LinkObject,
        type NodeObject,
    } from "force-graph";

    /*--------------------------------- Props --------------------------------*/

    const nodeRadius = 6;
    let container: HTMLDivElement;

    export let nodes: NodeObject[] = [];
    export let links: LinkObject[] = [];

    let data: GraphData = {
        nodes: [],
        links: [],
    };

    let graph: ForceGraphInstance;

    /*-------------------------------- Methods -------------------------------*/

    /*------------------------------- Lifecycle ------------------------------*/

    $: {
        data.nodes = [...nodes];
        data.links = [...links];
        graph?.graphData(data);
    }

    onMount(() => {
        graph = ForceGraph();
        graph(container).graphData(data);
    });
</script>

<!-- SVG was here -->
<div class="container" bind:this={container}></div>

<style>
    .container {
        width: 100%;
        height: 100%;
    }
</style>
