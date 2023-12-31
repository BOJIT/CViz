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

    import theme from "@bojit/svelte-components/theme";

    import {
        RadioButtonOff,
        RadioButtonOn,
        RemoveCircle,
        CheckmarkCircle,
    } from "@svicons/ionicons-outline";

    import { clickOutside } from "$lib/utils/clickoutside";

    import { createEventDispatcher } from "svelte";

    /*--------------------------------- Props --------------------------------*/

    export let include: boolean = true;
    export let blacklist: boolean = true;

    let showPalette = false;

    // TODO make theme-reactive
    let colourPalette = [...Array(8).keys()].map((i) => {
        let arr = theme.swatchColorJS(i);
        return `#${arr[0][0].toString(16).padStart(2, "0")}${arr[0][1]
            .toString(16)
            .padStart(2, "0")}${arr[0][2].toString(16).padStart(2, "0")}`;
    });

    export let colour = colourPalette[0];

    const dispatch = createEventDispatcher();

    /*-------------------------------- Methods -------------------------------*/

    /*------------------------------- Lifecycle ------------------------------*/
</script>

<div class="btn-group">
    <button
        class="toggle"
        on:click|stopPropagation={() => {
            include = !include;
            dispatch("include", include);
        }}
    >
        {#if include}
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

    <button
        class="toggle rel"
        on:click|stopPropagation={() => {
            showPalette = !showPalette;
        }}
    >
        <div class="col-circle" style:background-color={colour} />
        {#if showPalette}
            <div
                class="palette"
                use:clickOutside
                on:click_outside={() => {
                    setTimeout(() => {
                        showPalette = false;
                    }, 100);
                }}
            >
                {#each colourPalette as c}
                    <button
                        class="col-circle"
                        style:background-color={c}
                        on:click={() => {
                            colour = c;
                        }}
                    />
                {/each}
            </div>
        {/if}
    </button>
</div>

<style>
    .btn-group {
        display: flex;
        gap: 0.2rem;
        align-items: center;
        justify-content: center;
    }

    .toggle {
        border-radius: 50%;
        z-index: 20;
    }

    .toggle:hover {
        background-color: gray;
    }

    .palette {
        position: absolute;
        top: 1rem;
        left: 1rem;
        width: 5.4rem;

        border-radius: 0.7rem;
        background-color: var(--color-gray-700);
        padding: 0.5rem;

        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;

        z-index: 30;
    }

    .rel {
        position: relative;
        height: 1rem;
        width: 1rem;
        display: grid;
        place-content: center;
    }

    .col-circle {
        height: 0.8rem;
        width: 0.8rem;
        border-radius: 50%;
    }
</style>
