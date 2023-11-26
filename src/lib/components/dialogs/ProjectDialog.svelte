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

    import projects from "$lib/stores/projects";

    /*--------------------------------- Props --------------------------------*/

    export let visible: boolean = true;

    let searchableList: SearchableList;

    /*-------------------------------- Methods -------------------------------*/

    function listTransform(list: string[]) {
        const dict: any = {};
        list.forEach((l) => {
            dict[l] = { icon: Document };
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
<BaseDialog bind:visible persistent icon={FolderOpen} title="Open Project">
    <SearchableList
        bind:this={searchableList}
        items={listTransform($projects)}
        buttons={[Trash]}
        on:select={(s) => {
            setTimeout(async () => {
                // Create template config file if it doesn't exist

                // Set current project store (TODO workout file-watcher approach)

                // if ((await patch.open(s.detail)) === false) {
                //     message.push({
                //         type: "error",
                //         title: "File Error",
                //         message: "Could not open file!",
                //         timeout: 5,
                //     });

                //     return;
                // }

                visible = false;
            }, 200);
        }}
        on:button={async (e) => {
            if (e.detail.index === 0) {
                // TODO prompt whether to keep the `cviz.config.yaml` file
                // Remove from filesystem access API
            }
        }}
    />

    <br />
    <div style="padding-left: 0.3rem">
        <!-- TODO fix theming -->
        <TextIconButton
            icon={FolderOpen}
            label="Add from Filesystem"
            outlined
            color={$theme === "dark" ? "white" : "primary"}
            on:click={async () => {
                const dir = await window.showDirectoryPicker();

                console.log(dir);

                // Set active project on success
            }}
        />
    </div>
</BaseDialog>
