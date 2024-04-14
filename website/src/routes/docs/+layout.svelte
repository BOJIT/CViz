<!--
 * @file +layout.svelte
 * @author James Bennion-Pedley
 * @brief Brief summary here
 * @date 07/02/2023
 *
 * @copyright Copyright (c) 2023
 *
-->

<script lang="ts">
    /*-------------------------------- Imports -------------------------------*/

    import { goto } from "$app/navigation";

    import {
        Content,
        NavBar,
        type NavItem,
    } from "@bojit/svelte-components/layout";

    import { Eyedrop, Home } from "@svicons/ionicons-outline";

    import logo from "$lib/assets/img/Logo.png";

    /*--------------------------------- Props --------------------------------*/

    let items: NavItem[] = [
        {
            type: "button",
            color: "transparent",
            icon: Home,
            label: "Home",
            callback: () => {
                goto("/");
            },
        },
    ];

    /*-------------------------------- Methods -------------------------------*/

    /*------------------------------- Lifecycle ------------------------------*/
</script>

<!-- Main Navigation -->
<NavBar
    title="CViz"
    {logo}
    logoLink="https://github.com/BOJIT/CViz"
    themeOverride="dark"
    {items}
/>

<Content>
    <slot />
</Content>
