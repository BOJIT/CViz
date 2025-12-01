<!--
 * @file +layout.svelte
 * @author James Bennion-Pedley
 * @brief Example top-level layout
 * @date 27/12/2024
 *
 * @copyright Copyright (c) 2024
 *
-->

<script lang="ts">
    /*-------------------------------- Imports -------------------------------*/

    import { App, UI } from '@bojit/svelte-components';
    import { type Icon } from '@bojit/svelte-components/icons';

    import PaintBrush from 'carbon-icons-svelte/lib/PaintBrush.svelte';
    import LogoGithub from 'carbon-icons-svelte/lib/LogoGithub.svelte';
    import FolderIcon from 'carbon-icons-svelte/lib/Folder.svelte';
    import SettingsIcon from 'carbon-icons-svelte/lib/Settings.svelte';
    import RestartIcon from 'carbon-icons-svelte/lib/Restart.svelte';

    import logo from '$lib/assets/Logo.png';

    import '../app.css';

    /*--------------------------------- Props --------------------------------*/

    let { children } = $props();

    let app: App;

    /*-------------------------------- Methods -------------------------------*/

    /*------------------------------- Lifecycle ------------------------------*/
</script>

<svelte:head><title>CViz</title></svelte:head>

<App defaultMode="system" bind:this={app}>
    <UI.NavBar
        title="CViz"
        {logo}
        logoLink="https://github.com/BOJIT/CViz"
        themeOverride="dark"
        items={[
            {
                type: 'button',
                icon: RestartIcon as Icon,
                label: 'Refresh',
                visibility: 'desktop',
                onclick: () => {
                    app.launchThemeSelector();
                }
            },
            {
                type: 'button',
                icon: FolderIcon as Icon,
                label: 'Open Project',
                visibility: 'desktop',
                onclick: () => {
                    app.launchThemeSelector();
                }
            },
            {
                type: 'separator',
                visibility: 'desktop'
            },
            {
                type: 'button',
                icon: LogoGithub as Icon,
                label: 'Source Code',
                link: 'https://github.com/BOJIT/CViz',
                visibility: 'desktop'
            },
            {
                type: 'button',
                icon: PaintBrush as Icon,
                label: 'Set Theme',
                visibility: 'desktop',
                onclick: () => {
                    app.launchThemeSelector();
                }
            },
            {
                type: 'button',
                icon: SettingsIcon as Icon,
                label: 'Settings',
                visibility: 'desktop',
                onclick: () => {
                    app.launchThemeSelector();
                }
            }
        ]}
    />
    {@render children()}
</App>
