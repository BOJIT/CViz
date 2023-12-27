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

    import * as PIXI from "pixi.js";
    import { Viewport } from "pixi-viewport";

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

    export let nodes: Node[] = [];
    export let links: Link[] = [];

    // Container props
    let width: number;
    let height: number;
    let container: HTMLDivElement;

    // D3
    let simulation: Simulation<
        SimulationNodeDatum,
        SimulationLinkDatum<SimulationNodeDatum>
    >;

    // Data mapping
    let nodeDataToNodeGfx = new WeakMap();
    let nodeGfxToNodeData = new WeakMap();
    let nodeDataToLabelGfx = new WeakMap();
    let labelGfxToNodeData = new WeakMap();
    let linkDataToLinkGfx = new WeakMap();
    let linkGfxToLinkData = new WeakMap();

    let nodeDataGfxPairs: any[] = [];
    let linkDataGfxPairs: any[] = [];

    // PIXI graphics storage
    const linksLayer = new PIXI.Container();
    const nodesLayer = new PIXI.Container();
    const labelsLayer = new PIXI.Container();
    let circleTexture: PIXI.RenderTexture;
    let triangleTexture: PIXI.RenderTexture;

    // Styling
    const nodeRadius = 10;
    const nodeFill = 0xffffff;
    const nodeStrokeWidth = 2;
    const nodeStrokeOpacity = 0.8;
    const nodeStroke = 0xff00ff;
    const linkStroke = 0x00ff00;
    const linkStrokeWidth = 2;
    const linkStrokeOpacity = 0.8;
    const labelFill = 0xffff00;

    /*-------------------------------- Methods -------------------------------*/

    /**
     * Must be called when the nodes/links change
     */
    function updateGraph(n: Node[], l: Link[]) {
        // Re-run D3 simulation
        if (simulation === undefined) return;
        simulation.nodes(nodes).force("link").links(links);
        simulation.alphaTarget(0.5).restart();
        simulation.on("tick", () => updatePositions());

        nodeDataGfxPairs = [];
        nodes.forEach((node) => {
            let nodeGfx = new PIXI.Container();
            nodeGfx.name = node.id;
            nodeGfx.cursor = "pointer";
            nodeGfx.hitArea = new PIXI.Circle(0, 0, nodeRadius + 2);
            nodeGfx.eventMode = "static";
            nodeGfx.alpha = 1;

            const circle = new PIXI.Sprite(circleTexture);
            circle.name = "CIRCLE";
            circle.x = -nodeRadius;
            circle.y = -nodeRadius;
            circle.tint = nodeFill; // TODO based on group?
            circle.alpha = 1;
            circle.width = nodeRadius * 2;
            circle.height = nodeRadius * 2;

            nodeGfx.addChild(circle);
            nodesLayer.addChild(nodeGfx);

            let labelGfx = new PIXI.Container();
            labelGfx.visible = true;

            const textStyle = new PIXI.TextStyle({
                fontSize: nodeRadius * 2,
                align: "left",
                fill: labelFill,
                stroke: "black",
                strokeThickness: 6,
            });

            const label = new PIXI.Text(node.id, textStyle);
            label.name = "LABEL";
            label.x = nodeRadius + 3; // position label next to node without overlap
            label.y = -nodeRadius;
            label.resolution = 2;
            label.scale.set(0.5);

            labelGfx.addChild(label);
            labelsLayer.addChild(labelGfx);

            nodeDataGfxPairs.push([node, nodeGfx, labelGfx]);
        });

        linkDataGfxPairs = [];
        links.forEach((link) => {
            const lineSize = linkStrokeWidth;

            const linkGfx = new PIXI.Container();
            linkGfx.name = link.source.id + "-" + link.target.id;
            linkGfx.pivot.set(0, lineSize / 2);
            linkGfx.alpha = linkStrokeOpacity;

            const line = new PIXI.Sprite(PIXI.Texture.WHITE);
            line.name = "LINE";
            line.x = 0;
            line.y = -lineSize / 2;
            line.height = lineSize;

            linkGfx.addChild(line);

            const arrow = new PIXI.Sprite(triangleTexture);
            arrow.name = "ARROW";
            arrow.x = 0;
            arrow.y = -3;
            arrow.width = 6;
            arrow.height = 6;
            arrow.alpha = 0;
            linkGfx.addChild(arrow);
            linksLayer.addChild(linkGfx);

            linkDataGfxPairs.push([link, linkGfx]);
        });
    }

    /**
     * This should be called to run the force simulation
     */
    function updatePositions() {
        nodes.forEach((node) => {
            const nodeGfx = nodeDataToNodeGfx.get(node);
            const labelGfx = nodeDataToLabelGfx.get(node);

            if (nodeGfx === undefined || labelGfx === undefined) return;

            console.log(node);

            nodeGfx.x = node.x;
            nodeGfx.y = node.y;
            labelGfx.x = node.x;
            labelGfx.y = node.y;
        });

        links.forEach((link) => {
            const sourceNodeData = nodes.find((n) => n.id === link.source.id);
            const targetNodeData = nodes.find((n) => n.id === link.target.id);
            const linkGfx = linkDataToLinkGfx.get(link);

            if (
                sourceNodeData === undefined ||
                targetNodeData === undefined ||
                linkGfx === undefined
            )
                return;

            linkGfx.x = sourceNodeData.x;
            linkGfx.y = sourceNodeData.y;
            linkGfx.rotation = Math.atan2(
                targetNodeData.y - sourceNodeData.y,
                targetNodeData.x - sourceNodeData.x,
            );

            const line = linkGfx.getChildByName("LINE");
            const lineLength = Math.max(
                Math.sqrt(
                    (targetNodeData.x - sourceNodeData.x) ** 2 +
                        (targetNodeData.y - sourceNodeData.y) ** 2,
                ) - targetNodeData.radius,
                0,
            );
            line.width = lineLength;
        });
    }

    /*------------------------------- Lifecycle ------------------------------*/

    $: updateGraph(nodes, links);

    onMount(() => {
        // Size initial container and mount PIXI.js
        width = container.offsetWidth;
        height = container.offsetHeight;

        const app = new PIXI.Application({
            width,
            height,
            resolution: 2,
            antialias: true,
            autoDensity: true,
            autoStart: true,
        });

        container.appendChild(app.view as HTMLCanvasElement);

        // Create zoomable viewport
        const viewport = new Viewport({
            screenWidth: width,
            screenHeight: height,
            worldWidth: width,
            worldHeight: height,
            events: app.renderer.events,
        });

        app.stage.addChild(viewport);

        viewport.center = new PIXI.Point(0, 0);

        viewport
            .drag()
            .pinch()
            .wheel()
            .decelerate()
            .clampZoom({ minScale: 0.2, maxScale: 5 });

        // Add graphics layers
        viewport.addChild(linksLayer);
        viewport.addChild(nodesLayer);
        viewport.addChild(labelsLayer);

        // Node Graphics template
        const circleGraphics = new PIXI.Graphics();
        circleGraphics.beginFill(nodeFill);
        circleGraphics.lineStyle(
            nodeStrokeWidth,
            nodeStroke,
            nodeStrokeOpacity,
        );
        circleGraphics.drawCircle(0, 0, nodeRadius * 2);

        circleTexture = app.renderer.generateTexture(circleGraphics, {
            resolution: 2,
        });

        // Link Graphics template
        const triangle = new PIXI.Graphics();
        let triangleWidth = 12;
        triangle.beginFill(linkStroke, 1);
        triangle.lineStyle(0, linkStroke, 1);
        triangle.moveTo(-triangleWidth, 0);
        triangle.lineTo(triangleWidth, triangleWidth);
        triangle.lineTo(triangleWidth, -triangleWidth);
        triangle.endFill();

        triangleTexture = app.renderer.generateTexture(triangle, {
            resolution: 2,
        });

        // Create weak map links
        nodeDataToNodeGfx = new WeakMap(
            nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [
                nodeData,
                nodeGfx,
            ]),
        );
        nodeGfxToNodeData = new WeakMap(
            nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [
                nodeGfx,
                nodeData,
            ]),
        );
        nodeDataToLabelGfx = new WeakMap(
            nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [
                nodeData,
                labelGfx,
            ]),
        );
        labelGfxToNodeData = new WeakMap(
            nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [
                labelGfx,
                nodeData,
            ]),
        );
        linkDataToLinkGfx = new WeakMap(
            linkDataGfxPairs.map(([linkData, linkGfx]) => [linkData, linkGfx]),
        );
        linkGfxToLinkData = new WeakMap(
            linkDataGfxPairs.map(([linkData, linkGfx]) => [linkGfx, linkData]),
        );

        // D3 Simulation
        simulation = d3
            .forceSimulation()
            .force(
                "link",
                d3.forceLink().id((d) => d.id),
            )
            .force("charge", d3.forceManyBody().strength(-100).distanceMin(100))
            .on("tick", () => updatePositions());

        // Initial update (if data already populated)
        updateGraph(nodes, links);
    });
</script>

<!-- Mount PIXI to a container div -->
<div class="container" bind:this={container} />

<style>
    .container {
        width: 100%;
        height: 100%;
    }
</style>
