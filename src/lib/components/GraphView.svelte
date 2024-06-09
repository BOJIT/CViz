<!--
 * @file GraphView.svelte
 * @author James Bennion-Pedley
 * @brief Brief summary here
 * @date 26/11/2023
 *
 * @copyright Copyright (c) 2023
 *
-->

<script lang="ts">
    /*-------------------------------- Imports -------------------------------*/

    import { onMount } from "svelte";

    import ForceGraph, { type ForceGraphInstance } from "force-graph";
    import { forceCenter, forceX, forceY } from "d3-force";

    import type { Graph } from "$lib/stores/graph";

    import { activeProject } from "$lib/stores/projects";
    import tree, { selectedNode } from "$lib/stores/tree";

    /*--------------------------------- Props --------------------------------*/

    let container: HTMLDivElement;

    export let data: Graph = {
        nodes: [],
        links: [],
        treeSet: new Set(),
        treeMap: new Map(),
    };

    let graph: ForceGraphInstance;

    const headerExtensions: string[] = [".h", ".hpp", ".hh", ".h++"];

    /*-------------------------------- Methods -------------------------------*/

    function recenter() {
        graph?.zoomToFit(2000, 200);
    }

    /*------------------------------- Lifecycle ------------------------------*/

    activeProject.subscribe((p) => {
        // On change re-center the graph after a delay
        setTimeout(recenter, 200);
    });

    // Recompute graph on data change
    $: {
        graph?.graphData(data);
        graph?.d3ReheatSimulation();
    }

    onMount(() => {
        graph = ForceGraph();
        graph(container).graphData(data);

        // Environment Forces
        const fC = forceCenter().strength(0.5);
        const fX = forceX().strength(0.05);
        const fY = forceY().strength(0.05);

        // Root styling
        graph
            .linkColor(() => "rgba(255,255,255,0.2)")
            .linkWidth(() => 2)
            // .dagMode("td")
            // .dagLevelDistance(40)
            // .onDagError(() => {})
            .linkDirectionalParticles(2)
            .linkDirectionalParticleSpeed(0.005)
            .linkDirectionalParticleWidth(3)
            .d3Force("center", fC)
            .d3Force("x", fX)
            .d3Force("y", fY)
            .nodeLabel((n) => n.id as string)
            .nodeColor((n) => {
                let id: string = n.id as string;
                let isHeader = headerExtensions.some((h) => id.endsWith(h));

                if ($selectedNode && tree.flattenKey($selectedNode) === n.id)
                    return "#EDB120";

                if (n.colour) return n.colour;

                return isHeader ? "#0072BD" : "#D95319";
            });

        // Events
        graph.onNodeClick((n, e) => {
            if (n.id) selectedNode.set(tree.unflattenKey(n.id as string));
        });
    });
</script>

<svelte:window
    on:resize={() => {
        // Resize underlying canvas
        let canvas = container.querySelector("canvas");
        if (!canvas) return;

        canvas.style.width = container.offsetWidth.toString();
        canvas.style.height = container.offsetHeight.toString();

        setTimeout(recenter, 200);
    }}
/>

<div class="container" bind:this={container}></div>

<style>
    .container {
        width: 100%;
        height: 100%;

        overflow: hidden;
    }
</style>
