<!--
 * @file ProjectDialog.svelte
 * @author James Bennion-Pedley
 * @brief Open a folder from file access API and create project file on opening
 * @date 08/02/2023
 *
 * @copyright Copyright (c) 2023
 *
-->

<script lang="ts">
    /*-------------------------------- Imports -------------------------------*/

    import { message } from "@bojit/svelte-components/core";
    import {
        SearchableList,
        TextIconButton,
    } from "@bojit/svelte-components/form";
    import { BaseDialog } from "@bojit/svelte-components/layout";
    import theme from "@bojit/svelte-components/theme";

    import { Document, FolderOpen, Trash } from "@svicons/ionicons-outline";

    import projects, {
        activeProject,
        type ProjectStore,
    } from "$lib/stores/projects";

    import { pickDirectory } from "$lib/utils/commands";

    /*--------------------------------- Props --------------------------------*/

    export let visible: boolean = true;

    let searchableList: SearchableList;

    /*-------------------------------- Methods -------------------------------*/

    function listTransform(p: ProjectStore) {
        const dict: any = {};
        Object.entries(p).forEach(([key, value]) => {
            // TODO add custom project icons
            dict[key] = {
                icon: Document,
                description: key,
                searchKey: value.shortName,
            };
        });

        return dict;
    }

    /*------------------------------- Lifecycle ------------------------------*/

    $: if (visible) {
        if (searchableList) {
            if (searchableList.focus) searchableList?.focus();
        }
    }
</script>

<!-- TODO put in base dialogue -->
<BaseDialog
    bind:visible
    persistent={Object.keys($projects).length === 0 || $activeProject === null}
    icon={FolderOpen}
    title="Open Project"
>
    {#if Object.keys($projects).length}
        <SearchableList
            bind:this={searchableList}
            items={listTransform($projects)}
            buttons={[Trash]}
            on:select={(s) => {
                $activeProject = s.detail;

                visible = false;
            }}
            on:button={async (e) => {
                if (e.detail.index === 0) {
                    // Close project if active
                    if ($activeProject === e.detail.key) $activeProject = null;

                    // TODO prompt whether to keep the `cviz.config.yaml` file
                    projects.remove(e.detail.key);
                }
            }}
        />
    {/if}

    <br />
    <div style="padding-left: 0.3rem">
        <!-- TODO fix theming -->
        <TextIconButton
            icon={FolderOpen}
            label="Add from Filesystem"
            outlined
            color={$theme === "dark" ? "white" : "primary"}
            on:click={async () => {
                const dir = await pickDirectory();

                if (dir === "") {
                    message.push({
                        type: "error",
                        title: "Invalid Project",
                        message: "No directory selected",
                    });
                    return;
                }

                // Add directory and set active project on success
                if (projects.add(dir) === true) {
                    message.push({
                        type: "warning",
                        title: "Duplicate Project",
                        message: "This project already exists",
                    });
                }

                $activeProject = dir;
                visible = false;
            }}
        />
    </div>
</BaseDialog>
