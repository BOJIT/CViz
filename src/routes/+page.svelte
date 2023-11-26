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

    import { Settings } from "@svicons/ionicons-outline";

    import logo from "$lib/assets/img/Logo.png";
    import ProjectDialog from "$lib/components/dialogs/ProjectDialog.svelte";
    import GraphView from "$lib/components/GraphView.svelte";

    // TEMP
    import data from "$lib/components/data";

    // Stores
    import { projectOverlay, settingsOverlay } from "$lib/stores/overlays";
    import projects from "$lib/stores/projects";

    /*--------------------------------- Props --------------------------------*/

    let items: NavItem[] = [
        {
            type: "button",
            color: "transparent",
            icon: Settings,
            label: "[⌘ + ' ]",
            visibility: "desktop",
            callback: () => {
                $settingsOverlay = true;
            },
        },
    ];

    /*-------------------------------- Methods -------------------------------*/

    /*------------------------------- Lifecycle ------------------------------*/

    onMount(async () => {
        // TEMP
        $projectOverlay = true;

        $projects = ["test project", "another list"];
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
<GraphView graph={data} />

<ProjectDialog bind:visible={$projectOverlay} />

{#if import.meta.env.VITE_SHOW_UNSTABLE === "true"}
    <!-- Beta Banner -->
    <div class="beta">
        <h6>This is a beta release! Beware of breaking changes!</h6>
    </div>
{/if}

<style>
    :global(.app) {
        height: 100vh !important;
    }

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
