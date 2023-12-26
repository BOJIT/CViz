/**
 * @file config.ts
 * @author James Bennion-Pedley
 * @brief YAML-Config saved in project workspace root
 * @date 24/12/2023
 *
 * @copyright Copyright (c) 2023
 *
 */

/*-------------------------------- Imports -----------------------------------*/

import { writable, type Writable } from "svelte/store";

import type { ConfigTree } from "$lib/ipc";

/*--------------------------------- State ------------------------------------*/

const VERSION = 1; // TODO link to releases?

const store: Writable<ConfigTree> = writable({
    syntax: VERSION,
});

/*------------------------------- Functions ----------------------------------*/

async function init(): Promise<Writable<ConfigTree>> {
    return store;
}

function reset(): void {
    store.set({
        syntax: VERSION,
    });
}

/*-------------------------------- Exports -----------------------------------*/

export default {
    set: store.set,
    subscribe: store.subscribe,
    update: store.update,
    init,
    reset,
};
