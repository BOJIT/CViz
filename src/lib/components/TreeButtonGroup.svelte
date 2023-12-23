<!--
 * @file TreeButtonGroup.svelte
 * @author James Bennion-Pedley
 * @brief Button group for file tree configuration
 * @date 23/12/2023
 *
 * @copyright Copyright (c) 2023
 *
-->

<script lang="ts">
    /*-------------------------------- Imports -------------------------------*/

    import {
        RadioButtonOff,
        RadioButtonOn,
        RemoveCircle,
    } from "@svicons/ionicons-outline";

    /*--------------------------------- Props --------------------------------*/

    let ignore: boolean = false;
    let blacklist: boolean = true;

    /*-------------------------------- Methods -------------------------------*/

    // TODO stop click events propogating to the tree view

    /*------------------------------- Lifecycle ------------------------------*/
</script>

<div class="btn-group">
    {#if ignore}
        <RadioButtonOn height="1rem" />
    {:else}
        <RadioButtonOff height="1rem" />
    {/if}

    {#if blacklist}
        <RemoveCircle height="1rem" />
    {:else}
        <RadioButtonOff height="1rem" />
    {/if}
</div>

<style>
    .btn-group {
        display: flex;
        gap: 0.2rem;
    }
</style>
