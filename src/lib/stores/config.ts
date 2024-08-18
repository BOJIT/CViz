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

import { derived, type Readable } from "svelte/store";

import type { ConfigTree } from "$lib/ipc";

import tree from "$lib/stores/tree";

/*--------------------------------- State ------------------------------------*/

const DEFAULT_STORE: ConfigTree = {
    syntax: 1,
}

const store: Readable<ConfigTree> = derived(tree, (t, set, update) => {
    update((c) => {
        // Walk nodes and write back changes that are non-default

        if (!c.nodeConfig) c.nodeConfig = {};

        c.nodeConfig["test"] = {
            include: true,
        };

        return c;
    })
}, structuredClone(DEFAULT_STORE));

/*------------------------------- Functions ----------------------------------*/


/*-------------------------------- Exports -----------------------------------*/

export default {
    subscribe: store.subscribe,
};
