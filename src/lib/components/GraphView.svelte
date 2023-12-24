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
        source: Node;
        target: Node;
        value: number;
    }
    export { type Node, type Link };
</script>

<script lang="ts">
    /*-------------------------------- Imports -------------------------------*/

    import { onMount } from "svelte";

    import { scaleLinear, scaleOrdinal } from "d3-scale";
    import { zoom, zoomIdentity } from "d3-zoom";
    import { schemeCategory10 } from "d3-scale-chromatic";
    import { select, selectAll } from "d3-selection";
    import { drag } from "d3-drag";
    import {
        forceSimulation,
        forceLink,
        forceManyBody,
        forceCenter,
    } from "d3-force";

    import type {
        Simulation,
        SimulationNodeDatum,
        SimulationLinkDatum,
    } from "d3-force";

    /*--------------------------------- Props --------------------------------*/

    let d3 = {
        zoom,
        zoomIdentity,
        scaleLinear,
        scaleOrdinal,
        schemeCategory10,
        select,
        selectAll,
        drag,
        forceSimulation,
        forceLink,
        forceManyBody,
        forceCenter,
    };

    let svg: SVGElement;
    let width: number;
    let height: number;
    const nodeRadius = 6;
    let container: HTMLDivElement;

    const colourScale = d3.scaleOrdinal(d3.schemeCategory10);

    let transform = d3.zoomIdentity;
    let simulation: Simulation<Node, Link>;

    export let nodes: Node[] = [];
    export let links: Link[] = [];

    /*-------------------------------- Methods -------------------------------*/

    function simulationUpdate() {
        simulation.tick();
        nodes = [...nodes];
        links = [...links];
    }

    function zoomed(currentEvent: any) {
        transform = currentEvent.transform;
        simulationUpdate();
    }

    function dragsubject(currentEvent: any) {
        const node = simulation.find(
            transform.invertX(currentEvent.x),
            transform.invertY(currentEvent.y),
            nodeRadius,
        );
        if (node && node.x && node.y) {
            node.x = transform.applyX(node.x);
            node.y = transform.applyY(node.y);
        }
        return node;
    }

    function dragstarted(currentEvent: any) {
        if (!currentEvent.active) simulation.alphaTarget(0.3).restart();
        currentEvent.subject.fx = transform.invertX(currentEvent.subject.x);
        currentEvent.subject.fy = transform.invertY(currentEvent.subject.y);
    }

    function dragged(currentEvent: any) {
        currentEvent.subject.fx = transform.invertX(currentEvent.x);
        currentEvent.subject.fy = transform.invertY(currentEvent.y);
    }

    function dragended(currentEvent: any) {
        if (!currentEvent.active) simulation.alphaTarget(0);
        currentEvent.subject.fx = null;
        currentEvent.subject.fy = null;
    }

    function resize() {
        ({ width, height } = svg.getBoundingClientRect());
    }

    /*------------------------------- Lifecycle ------------------------------*/

    $: {
        if (simulation) {
            simulation
                .nodes(nodes)
                .force(
                    "link",
                    d3.forceLink(links).id((d) => d.id),
                )
                .force("charge", d3.forceManyBody())
                .force("center", d3.forceCenter(width / 2, height / 2));
            simulationUpdate();
        }
    }

    onMount(() => {
        // Initial scale
        width = container.offsetWidth;
        height = container.offsetHeight;

        simulation = d3
            .forceSimulation(nodes)
            .force(
                "link",
                d3.forceLink(links).id((d) => d.id),
            )
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2))
            .on("tick", simulationUpdate);

        d3.select(svg)
            .call(
                d3
                    .drag()
                    .container(svg)
                    .subject(dragsubject)
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended),
            )
            .call(
                d3
                    .zoom()
                    .scaleExtent([1 / 10, 8])
                    .on("zoom", zoomed),
            );
    });
</script>

<svelte:window on:resize={resize} />

<!-- SVG was here -->
<div class="container" bind:this={container}>
    <svg bind:this={svg} {width} {height}>
        {#each links as link}
            <g stroke="#999" stroke-opacity="0.6">
                <line
                    x1={link.source.x}
                    y1={link.source.y}
                    x2={link.target.x}
                    y2={link.target.y}
                    transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})"
                >
                    <title>{link.source.id}</title>
                </line>
            </g>
        {/each}

        {#each nodes as point}
            <circle
                class="node"
                r={nodeRadius}
                fill={colourScale(point.group.toString())}
                cx={point.x}
                cy={point.y}
                transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})"
            >
                <title>{point.id}</title></circle
            >
        {/each}
    </svg>
</div>

<style>
    svg {
        float: left;
        width: 100%;
        height: 100%;
    }

    circle {
        stroke: #fff;
        stroke-width: 1.5;
    }

    .container {
        width: 100%;
        height: 100%;
    }
</style>
