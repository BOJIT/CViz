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

import type { UINotification } from "$lib/ipc";

/*--------------------------------- State ------------------------------------*/

const handles: UnlistenFn[] = [];

/*------------------------------- Functions ----------------------------------*/

function handleFileChangeset(event: Event<any>) {
    console.log(event);
}

function handleUINotify(event: Event<UINotification>) {
    message.push({
        type: event.payload.msg_type,
        title: event.payload.title,
        message: event.payload.message,
        timeout: event.payload.timeout,
    });
}

async function init() {
    handles.push(await listen<any>("file-changeset", handleFileChangeset));
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
