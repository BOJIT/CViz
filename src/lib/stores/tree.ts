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

/*--------------------------------- Types ------------------------------------*/

type TreeStore = {

}

/*--------------------------------- State ------------------------------------*/

const DEFAULT = {};

const store: Writable<TreeStore> = writable(DEFAULT);

/*------------------------------- Functions ----------------------------------*/

async function init(): Promise<Writable<TreeStore>> {

    return store;
}

function reset(): void {
    store.set(DEFAULT);
}

/*-------------------------------- Exports -----------------------------------*/

export default {
    set: store.set,
    subscribe: store.subscribe,
    update: store.update,
    init,
    reset,
};
