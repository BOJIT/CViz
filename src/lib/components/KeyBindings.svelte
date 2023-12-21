<!--
 * @file KeyBindings.svelte
 * @author James Bennion-Pedley
 * @brief Handle all app keyboard shortcuts that are global scope
 * @date 08/02/2023
 *
 * @copyright Copyright (c) 2023
 *
-->

<script lang="ts">
    /*-------------------------------- Imports -------------------------------*/

    import {
        projectOverlay,
        settingsOverlay,
        themeOverlay,
    } from "$lib/stores/overlays";

    /*--------------------------------- Props --------------------------------*/

    /*-------------------------------- Methods -------------------------------*/

    function handleKeydown(event: KeyboardEvent) {
        // Escape key can break the focused element REGARDLESS of condition
        if (event.key === "Escape") {
            if (document.activeElement) {
                window.focus();
                (document.activeElement as HTMLElement).blur();
            }
        }

        // If we are in a text area, disable any global keyboard events
        if (
            document.activeElement &&
            (document.activeElement.tagName === "TEXTAREA" ||
                document.activeElement.tagName === "INPUT")
        ) {
            return;
        }

        // modifier on its own does nothing
        if (event.key === "Control") return;
        if (event.key === "Meta") return;
        if (event.key === "Shift") return;
        if (event.key === "Enter") return;

        // Are we in reserved dialogues?
        if ($projectOverlay === true) return;
        if ($settingsOverlay === true) return;
        if ($themeOverlay === true) return;

        // Global controls
        if ((event.ctrlKey || event.metaKey) && event.key === "o") {
            $projectOverlay = true;
        } else if ((event.ctrlKey || event.metaKey) && event.key === ",") {
            $settingsOverlay = true;
        } else if ((event.ctrlKey || event.metaKey) && event.key === "s") {
            event.preventDefault(); // Saving should not do anything!
        } else {
            // Unhandled case
            return;
        }

        event.preventDefault();
    }

    /*------------------------------- Lifecycle ------------------------------*/
</script>

<svelte:window on:keydown={handleKeydown} />
