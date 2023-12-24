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
        CheckmarkCircle,
    } from "@svicons/ionicons-outline";

    // import ColorPicker from "svelte-awesome-color-picker";

    /*--------------------------------- Props --------------------------------*/

    export let ignore: boolean = true;
    export let blacklist: boolean = true;

    // export let colour: string = "#0000FF";

    /*-------------------------------- Methods -------------------------------*/

    /*------------------------------- Lifecycle ------------------------------*/
</script>

<div class="btn-group">
    <button
        class="toggle"
        on:click|stopPropagation={() => {
            ignore = !ignore;
        }}
    >
        {#if ignore}
            <RadioButtonOn height="1rem" />
        {:else}
            <RadioButtonOff height="1rem" />
        {/if}
    </button>

    <button
        class="toggle"
        on:click|stopPropagation={() => {
            blacklist = !blacklist;
        }}
    >
        {#if blacklist}
            <RemoveCircle height="1rem" />
        {:else}
            <CheckmarkCircle height="1rem" />
        {/if}
    </button>

    <!-- <div class="colpick">
        <ColorPicker bind:hex={colour} isAlpha={false} label="" />
    </div> -->
</div>

<style>
    .btn-group {
        display: flex;
        gap: 0.2rem;
    }

    .toggle {
        border-radius: 50%;
        z-index: 20;
    }

    .toggle:hover {
        background-color: gray;
    }

    .colpick {
        z-index: 30;
    }

    .colpick :global(.picker) {
        z-index: 30;
    }

    .colpick :global(.color),
    :global(.alpha) {
        width: 1rem !important;
        height: 1rem !important;
    }
</style>
