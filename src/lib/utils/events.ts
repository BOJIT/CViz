/**
 * @file events.ts
 * @author James Bennion-Pedley
 * @brief Hooks for Tauri-generated events
 * @date 04/12/2023
 *
 * @copyright Copyright (c) 2023
 *
 */

/*-------------------------------- Imports -----------------------------------*/

import { message } from "@bojit/svelte-components/core";
import { listen, type Event, type UnlistenFn } from '@tauri-apps/api/event'

import type { FileChangeset, UINotification } from "$lib/ipc";

import tree from "$lib/stores/tree";

/*--------------------------------- State ------------------------------------*/

const handles: UnlistenFn[] = [];

/*------------------------------- Functions ----------------------------------*/

function handleFileChangeset(event: Event<FileChangeset[]>) {
    tree.applyChangesets(event.payload);
}

function handleUINotify(event: Event<UINotification>) {
    message.push(structuredClone(event.payload));
}

async function init() {
    handles.push(await listen<FileChangeset[]>("file-changeset", handleFileChangeset));
    handles.push(await listen<UINotification>("ui-notify", handleUINotify));
}

async function deinit() {
    while (handles.length > 0) {
        const h = handles.pop();
        if (h) h();
    }
}

/*-------------------------------- Exports -----------------------------------*/

export default {
    init,
    deinit,
};
