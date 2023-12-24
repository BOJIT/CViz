<!--
 * @file +page.svelte
 * @author James Bennion-Pedley
 * @brief Main UI
 * @date 07/02/2023
 *
 * @copyright Copyright (c) 2023
 *
-->

<script lang="ts">
    /*-------------------------------- Imports -------------------------------*/

    import { onMount } from "svelte";

    import { NavBar, type NavItem } from "@bojit/svelte-components/layout";

    import { FolderOpen, Settings } from "@svicons/ionicons-outline";

    import logo from "$lib/assets/img/Logo.png";
    import GraphOverlay from "$lib/components/GraphOverlay.svelte";
    import GraphView, { type Node } from "$lib/components/GraphView.svelte";
    import KeyBindings from "$lib/components/KeyBindings.svelte";
    import ProjectDialog from "$lib/components/dialogs/ProjectDialog.svelte";
    import SettingsDialog from "$lib/components/dialogs/SettingsDialog.svelte";

    // Stores
    import { projectOverlay, settingsOverlay } from "$lib/stores/overlays";
    import { activeProject } from "$lib/stores/projects";
    import tree from "$lib/stores/tree";

    /*--------------------------------- Props --------------------------------*/

    let items: NavItem[] = [
        {
            type: "button",
            color: "transparent",
            icon: FolderOpen,
            label: "Open Project",
            visibility: "desktop",
            callback: () => {
                $projectOverlay = true;
            },
        },
        {
            type: "button",
            color: "transparent",
            icon: Settings,
            label: "Settings",
            visibility: "desktop",
            callback: () => {
                $settingsOverlay = true;
            },
        },
    ];

    /*-------------------------------- Methods -------------------------------*/

    // TEMP
    // import graph from "$lib/components/data";

    // let graph: any = { nodes: [], links: [] };

    let nodes: Node[] = [];

    /*------------------------------- Lifecycle ------------------------------*/

    // Map store to graph nodes and edges
    tree.subscribe((t) => {
        let f = tree.flatten(t);

        // Add new/updated nodes to graph
        Object.entries(f).forEach((n) => {
            if (!nodes.some((s: Node) => s.id === n[0])) {
                nodes.push({
                    id: n[0],
                    group: n[0].endsWith(".h") ? 2 : 1,
                });
            }
        });

        // Prune any nodes no longer present
        nodes = nodes.filter((n) => n.id in f);
    });

    onMount(async () => {
        if ($activeProject === null) $projectOverlay = true;
    });
</script>

<svelte:head>
    <title>CViz</title>
</svelte:head>

<!-- Main Navigation -->
<NavBar
    title="CViz"
    {logo}
    logoLink="https://github.com/BOJIT/CViz"
    themeOverride="dark"
    {items}
/>

<!-- Interface here, active if there is a currently accessible project -->

{#if $activeProject !== null}
    <div class="graph-container">
        <GraphView {nodes} />
        <div class="graph-overlay">
            <GraphOverlay />
        </div>
    </div>
{/if}

<ProjectDialog bind:visible={$projectOverlay} />
<SettingsDialog bind:visible={$settingsOverlay} />

{#if import.meta.env.VITE_SHOW_UNSTABLE === "true"}
    <!-- Beta Banner -->
    <div class="beta">
        <h6>This is a beta release! Beware of breaking changes!</h6>
    </div>
{/if}

<KeyBindings />

<style>
    :global(.app) {
        height: 100vh !important;
    }

    .graph-container {
        width: 100%;
        height: calc(100vh - 3.8rem);
        position: relative;
    }

    .graph-overlay {
        position: absolute;
        top: 0px;
        bottom: 0px;
        left: 0px;
        right: 0px;

        pointer-events: none;
    }

    /* Banner for development release */
    .beta {
        position: fixed;
        text-align: center;
        bottom: 0px;
        width: 100%;
        z-index: 1000;
        padding: 0.2rem;
        color: black;

        background-color: rgba(204, 204, 127, 0.623);
    }

    .beta h6 {
        font-size: 0.8rem;
    }

    :global(.mode-dark) .beta {
        color: white;
        background-color: rgba(94, 94, 27, 0.425);
    }
</style>
