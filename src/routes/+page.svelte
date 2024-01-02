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
    import { ProgressLinear } from "@bojit/svelte-components/smelte";

    import { FolderOpen, Settings } from "@svicons/ionicons-outline";

    import logo from "$lib/assets/img/Logo.png";
    import GraphOverlay from "$lib/components/GraphOverlay.svelte";
    import GraphView, {
        type Node,
        type Link,
    } from "$lib/components/GraphView.svelte";
    import KeyBindings from "$lib/components/KeyBindings.svelte";
    import ProjectDialog from "$lib/components/dialogs/ProjectDialog.svelte";
    import SettingsDialog from "$lib/components/dialogs/SettingsDialog.svelte";

    // Stores
    import {
        loadingOverlay,
        projectOverlay,
        settingsOverlay,
    } from "$lib/stores/overlays";
    import { activeProject } from "$lib/stores/projects";
    import tree from "$lib/stores/tree";
    import config from "$lib/stores/config";

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

    let nodes: Node[] = [];
    let links: Link[] = [];

    /*------------------------------- Lifecycle ------------------------------*/

    // Map store to graph nodes and edges
    tree.subscribe((t) => {
        let f = tree.flatten(t);
        let newLinks: Link[] = [];

        let ignores = $config.ignoreList;
        Object.keys(f).forEach((k) => {
            // Prune out all ignored nodes
            ignores?.forEach((i) => {
                // Currently this only uses paths relative to the root
                // TODO add regex support?
                if (k in f && k.startsWith(i)) {
                    delete f[k];
                    return;
                }
            });
        });

        // Add new/updated nodes to graph
        Object.entries(f).forEach((n) => {
            let sourceNode: Node | undefined = undefined;
            if (!nodes.some((s: Node) => s.id === n[0])) {
                sourceNode = {
                    id: n[0],
                    group: n[0].endsWith(".h") ? 2 : 1,
                };
                nodes.push(sourceNode);
            }

            // Resolve dependencies
            n[1].dependencies?.forEach((i) => {
                let target = tree.resolve(
                    i,
                    f,
                    n[0].slice(0, n[0].lastIndexOf("/")),
                    $config.includeRoots,
                );

                if (target === null) return; // TODO mark stdlib

                let link = { source: target, target: n[0], value: 5 };
                newLinks.push(link);
            });
        });

        // Prune any nodes no longer present
        nodes = nodes.filter((n) => n.id in f);

        // Update to latest link copy
        links = newLinks;
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
        <GraphView {nodes} {links} />
        <div class="graph-overlay">
            <GraphOverlay />
        </div>
        {#if $loadingOverlay}
            <div class="progress-bar">
                <ProgressLinear />
            </div>
        {/if}
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

    .progress-bar {
        position: absolute;
        top: 0px;
        bottom: 0px;
        left: 0px;
        right: 0px;

        background-color: rgba(12, 12, 12, 0.5);
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
