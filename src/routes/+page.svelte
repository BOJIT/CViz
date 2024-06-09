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
    import GraphView from "$lib/components/GraphView.svelte";
    import KeyBindings from "$lib/components/KeyBindings.svelte";
    import ProjectDialog from "$lib/components/dialogs/ProjectDialog.svelte";
    import SettingsDialog from "$lib/components/dialogs/SettingsDialog.svelte";
    import StatusBar from "$lib/components/StatusBar.svelte";

    // Stores
    import graph from "$lib/stores/graph";
    import {
        loadingOverlay,
        projectOverlay,
        settingsOverlay,
    } from "$lib/stores/overlays";
    import { activeProject } from "$lib/stores/projects";

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

    /*------------------------------- Lifecycle ------------------------------*/

    onMount(async () => {
        // Show project picker if there isn't a pre-selected project
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
        <GraphView data={$graph} />
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

<StatusBar />

<ProjectDialog bind:visible={$projectOverlay} />
<SettingsDialog bind:visible={$settingsOverlay} />

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
</style>
