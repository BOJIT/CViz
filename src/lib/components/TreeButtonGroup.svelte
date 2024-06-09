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

    export let include: boolean = false;
    export let ignore: boolean = false;

    let showPalette = false;

    // TODO make theme-reactive
    let colourPalette = ["none"].concat(
        [...Array(7).keys()].map((i) => {
            let arr = theme.swatchColorJS(i);
            return `#${arr[0][0].toString(16).padStart(2, "0")}${arr[0][1]
                .toString(16)
                .padStart(2, "0")}${arr[0][2].toString(16).padStart(2, "0")}`;
        }),
    );

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
            dispatch("include");
        }}
    >
        {#if include}
            <RadioButtonOn height="20px" />
        {:else}
            <RadioButtonOff height="20px" />
        {/if}
    </button>

    <button
        class="toggle"
        on:click|stopPropagation={() => {
            ignore = !ignore;
            dispatch("ignore");
        }}
    >
        {#if ignore}
            <RemoveCircle height="20px" />
        {:else}
            <CheckmarkCircle height="20px" />
        {/if}
    </button>

    <button
        class="toggle rel"
        on:click|stopPropagation={() => {
            showPalette = !showPalette;
        }}
    >
        <div
            class="col-circle"
            class:checker={colour === "none"}
            style:background-color={colour !== "none" ? colour : null}
        />
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
                        class:checker={c === "none"}
                        style:background-color={c !== "none" ? c : null}
                        on:click={() => {
                            colour = c;
                            dispatch("colour");
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
        top: -20px;
        left: 30px;
        height: 54px;
        width: 102px;

        border-radius: 9px;
        background-color: var(--color-gray-700);
        padding: 6px;

        display: flex;
        flex-wrap: wrap;
        gap: 6px;

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
        height: 18px;
        width: 18px;
        border-radius: 50%;
    }

    .checker {
        background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),
            linear-gradient(135deg, #ccc 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #ccc 75%),
            linear-gradient(135deg, transparent 75%, #ccc 75%);
        background-size: 6px 6px; /* Must be a square */
        background-position:
            0 0,
            3px 0,
            3px -3px,
            0px 3px; /* Must be half of one side of the square */
    }
</style>
