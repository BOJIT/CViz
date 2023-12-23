<script>
    // NOTE this file is modified from the Smelte library version

    import { Icon, List, ListItem } from "@bojit/svelte-components/smelte";

    import { createEventDispatcher } from "svelte";
    import { slide } from "svelte/transition";

    export let items = [];
    export const value = "";
    export const text = "";
    export const dense = false;
    export const navigation = false;
    export const select = false;
    export let level = 0;
    export let showExpandIcon = true;
    export let expandIcon = "arrow_right";
    export let selectable = true;
    export let selected = null;
    export let selectedClasses = "bg-primary-trans";

    const classesDefault = "rounded";

    let expanded = [];

    const dispatch = createEventDispatcher();

    function toggle(i) {
        dispatch("select", i);

        if (selectable && !i.items) {
            selected = i;
        }

        expanded =
            i && !expanded.includes(i)
                ? [...expanded, i]
                : expanded.filter((si) => si !== i);
    }
</script>

<List {items} {...$$props}>
    <span slot="item" let:item>
        <ListItem
            {item}
            {...$$props}
            {...item}
            selected={selectable && selected === item}
            {selectedClasses}
            on:click={() => toggle(item)}
            on:click
        >
            <div class="flex items-center">
                {#if showExpandIcon && !item.hideArrow && item.items}
                    <Icon tip={expanded.includes(item)}>{expandIcon}</Icon>
                {/if}
                <slot {item}><span>{item.text}</span></slot>
            </div>
        </ListItem>

        {#if item.items && expanded.includes(item)}
            <div in:slide class="ml-6">
                <svelte:self
                    {...$$props}
                    items={item.items}
                    level={level + 1}
                    let:item
                    on:click
                    on:select
                >
                    <slot {item} />
                </svelte:self>
            </div>
        {/if}
    </span>
</List>
