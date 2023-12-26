<!--
 * @file Settings.svelte
 * @author James Bennion-Pedley
 * @brief Settings Dialogue
 * @date 08/02/2023
 *
 * @copyright Copyright (c) 2023
 *
-->

<script lang="ts">
    /*-------------------------------- Imports -------------------------------*/

    import { message } from "@bojit/svelte-components/core";
    import {
        AddableList,
        IconButton,
        SearchableList,
        TextIconButton,
    } from "@bojit/svelte-components/form";
    import { BaseDialog } from "@bojit/svelte-components/layout";
    import { TextField } from "@bojit/svelte-components/smelte";
    import { Tabs } from "@bojit/svelte-components/widgets";
    import theme from "@bojit/svelte-components/theme";
    const mode = theme.Mode;

    import {
        CheckmarkCircle,
        CloseCircle,
        Contrast,
        Moon,
        Settings,
        Sunny,
        Warning,
    } from "@svicons/ionicons-outline";

    import config from "$lib/stores/config";
    import settings from "$lib/stores/settings";

    import Logo from "$lib/assets/img/BOJIT_Square.png";

    /*--------------------------------- Types --------------------------------*/

    type KeyedList = {
        [key: string]: {};
    };

    /*--------------------------------- Props --------------------------------*/

    export let visible: boolean = true;

    const themes = [
        {
            theme: "light",
            icon: Sunny,
        },
        {
            theme: "dark",
            icon: Moon,
        },
        {
            theme: "auto",
            icon: Contrast,
        },
    ];

    const col = "rgba(120, 120, 120, 0.5)";
    const col_focus = "rgba(180, 180, 180, 0.5)";

    let tabs = [
        {
            label: "Project Settings",
        },
        {
            label: "Global Settings",
        },
        {
            label: "About CViz",
        },
    ];

    let index = 0;
    let areYouSure = false;

    /*-------------------------------- Methods -------------------------------*/

    function mod(n: number, m: number) {
        return ((n % m) + m) % m;
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Shift") return;

        if (event.shiftKey && event.key === "Tab") {
            event.preventDefault();
            index = mod(index - 1, tabs.length);
        } else if (event.key === "Tab") {
            event.preventDefault();
            index = mod(index + 1, tabs.length);
        }
    }

    function toKeyed(ss: string[] | undefined): KeyedList {
        let o: any = {};
        if (!ss) return o;
        ss.forEach((s) => {
            o[s] = {};
        });
        return o;
    }

    function fromKeyed(o: KeyedList): string[] {
        let ss: string[] = [];
        Object.keys(o)
            .sort()
            .forEach((k) => {
                ss.push(k);
            });
        return ss;
    }

    /*------------------------------- Lifecycle ------------------------------*/

    $: if (visible) {
        index = 0;
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<BaseDialog title="Settings" icon={Settings} bind:visible>
    <Tabs {tabs} bind:index fade>
        <!-- Project -->
        <div class="tab">
            <h5>Project Settings</h5>
            <hr />

            <div class="long-page">
                <!-- Project Include Roots -->
                <br />
                <code>Include Paths</code>
                <hr />
                <AddableList
                    items={toKeyed($config.includeRoots)}
                    maxHeight="10rem"
                    on:change={(e) => {
                        config.update((c) => {
                            c.includeRoots = fromKeyed(e.detail);
                            return c;
                        });
                    }}
                />

                <!-- Project Include Roots -->
                <br />
                <code>Ignore List</code>
                <hr />
                <AddableList
                    items={toKeyed($config.ignoreList)}
                    maxHeight="10rem"
                    on:change={(e) => {
                        config.update((c) => {
                            c.ignoreList = fromKeyed(e.detail);
                            return c;
                        });
                    }}
                />

                <!-- Project Groups-->
                <br />
                <code>Groups</code>
                <hr />
                <AddableList items={{}} maxHeight="10rem" />
            </div>
        </div>

        <!-- Global -->
        <div class="tab">
            <h5>Global Settings</h5>
            <hr />
            <h6 class="center">Select Theme</h6>
            <div class="themes center">
                {#each themes as t, i}
                    <IconButton
                        icon={t.icon}
                        color={$mode === t.theme ? col_focus : col}
                        size="3em"
                        disabled={$mode === t.theme}
                        on:click={() => {
                            $mode = t.theme;
                        }}
                        useRipple={false}
                    />
                {/each}
            </div>
            <br />
            <hr />
            <h6 class="center">Program Configuration</h6>
            <div class="themes center">
                <TextIconButton
                    icon={Warning}
                    label="Reset CViz"
                    shape="rounded"
                    outlined
                    color="error"
                    on:click={() => {
                        areYouSure = true;
                    }}
                />
            </div>
        </div>

        <!-- About -->
        <div class="tab">
            <h5>About This App</h5>
            <p>
                CViz is a source code analysis tool maintained by <a
                    href="https://bojit.org/">James Bennion-Pedley</a
                >.
            </p>
            <hr />
            <p>
                Current Release: <a
                    href={"https://github.com/BOJIT/CViz/commit/" +
                        import.meta.env.VITE_GIT_HASH}
                    target="_blank"
                    rel="noreferrer"
                >
                    {import.meta.env.VITE_GIT_HASH}
                </a>
            </p>
            <p>
                If you have an issue or feature request let me know on <a
                    href="https://github.com/BOJIT/CViz/"
                    target="_blank"
                    rel="noreferrer">GitHub</a
                >!
            </p>
            <hr />
            <div class="center">
                <img src={Logo} alt="BOJIT Logo" />
            </div>
        </div>
    </Tabs>
</BaseDialog>

<BaseDialog title="Confirm Reset" bind:visible={areYouSure}>
    <p>
        This will reset CViz to default state. Note that this will not delete
        project files from disk.
    </p>
    <div slot="actions">
        <TextIconButton
            label="Cancel"
            icon={CloseCircle}
            color="primary"
            on:click={() => {
                areYouSure = false;
            }}
        />
        <TextIconButton
            label="Confirm"
            icon={CheckmarkCircle}
            color="error"
            outlined
            on:click={() => {
                settings.reset();

                areYouSure = false;
                message.push({
                    type: "info",
                    title: "Reset Successful!",
                    message: "CViz has been reset to its default state",
                    timeout: 10,
                });
            }}
        />
    </div>
</BaseDialog>

<style>
    h5 {
        text-align: center;
        padding-top: 1rem;
    }

    h6 {
        margin-bottom: 0.3rem;
    }

    a {
        color: #237094;
    }

    p {
        /* max-width: 90%; */
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        text-align: center;
    }

    :global(.mode-dark) a {
        color: #95b4c2;
    }

    .center {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .themes {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }

    .long-page {
        max-height: 60vh;
        overflow: scroll;
    }

    img {
        max-width: 5rem;
        padding-top: 1rem;
    }

    hr {
        margin-top: 0.4rem;
        margin-bottom: 0.4rem;
    }
</style>
