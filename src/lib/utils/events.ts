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

/*--------------------------------- Types ------------------------------------*/

type UINotification = {
    msg_type: "info" | "warning" | "error",
    title: string,
    message: string,
    timeout: number,
};

/*--------------------------------- State ------------------------------------*/

const handles: UnlistenFn[] = [];

/*------------------------------- Functions ----------------------------------*/

function handleUINotify(event: Event<UINotification>) {
    console.log(event);

    message.push({
        type: event.payload.msg_type,
        title: event.payload.title,
        message: event.payload.message,
        // timeout: event.payload.timeout === 0 ? undefined : event.payload.timeout,
    });
}

async function init() {
    const h = await listen<UINotification>("ui-notify", handleUINotify);
    handles.push(h);
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
