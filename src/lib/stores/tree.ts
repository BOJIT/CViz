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

import { writable, type Writable, get } from "svelte/store";

import type { FileChangeset } from "$lib/ipc";

import { activeProject } from "$lib/stores/projects";

/*--------------------------------- Types ------------------------------------*/

type NodeData = {
    dependencies: string[]
}

export type NestedTree = {
    data?: NodeData,
    items?: {
        [key: string]: NestedTree,
    },
};

/*--------------------------------- State ------------------------------------*/

const store: Writable<NestedTree> = writable({});

/*------------------------------- Functions ----------------------------------*/

async function init(): Promise<Writable<NestedTree>> {
    return store;
}

function reset(): void {
    store.set({});
}

function applyChangeset(cs: FileChangeset) {
    // Pre-flight checks
    const prefix = get(activeProject);
    if (prefix === null) return;
    if (!cs.key.startsWith(prefix)) return;

    switch (cs.type) {
        case "added":
        case "modified":
            {
                // Populate nested tree
                let treeComponents = cs.key.slice(prefix.length).split('/').filter((c) => (c.length > 0));

                store.update((s) => {
                    let n = s;  // Root node REF
                    for (let i = 0; i < treeComponents.length; i++) {
                        if (n.items === undefined) n.items = {};

                        // Populate child if missing
                        if (n.items[treeComponents[i]] === undefined) n.items[treeComponents[i]] = {};
                        n = n.items[treeComponents[i]];  // by REF
                    }

                    // Populate final node data (TODO)
                    n.data = {
                        dependencies: cs.includes ? cs.includes : [],
                    };

                    return s;
                });

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
