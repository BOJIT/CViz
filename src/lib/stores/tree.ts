/**
 * @file tree.ts
 * @author James Bennion-Pedley
 * @brief Store of tree structure for filesystem graph
 * @date 20/12/2023
 *
 * @copyright Copyright (c) 2023
 *
 */

/*-------------------------------- Imports -----------------------------------*/

import { writable, type Writable } from "svelte/store";

import type { FileChangeset } from "$lib/ipc";

/*--------------------------------- Types ------------------------------------*/

type NodeData = {
    dependencies: string[]
}

export type TreeStore = {
    [key: string]: NodeData
}

/*--------------------------------- State ------------------------------------*/

const store: Writable<TreeStore> = writable({});

/*------------------------------- Functions ----------------------------------*/

async function init(): Promise<Writable<TreeStore>> {

    return store;
}

function reset(): void {
    store.set({});
}

function applyChangeset(cs: FileChangeset) {
    //
    switch (cs.type) {
        case "added":
        case "modified":
            {
                store.update((s) => {
                    s[cs.key] = {
                        dependencies: cs.includes ? cs.includes : [],
                    };
                    return s;
                })

                break;
            }
    }
}

/*-------------------------------- Exports -----------------------------------*/

export default {
    set: store.set,
    subscribe: store.subscribe,
    update: store.update,
    init,
    reset,
    applyChangeset,
};
