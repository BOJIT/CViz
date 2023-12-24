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
};

type FlattenedTree = {
    [key: string]: NodeData,
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

function flatten(t: NestedTree, parent?: string, res: FlattenedTree = {}): FlattenedTree {
    if (!(t.items)) return res;

    Object.entries(t.items).forEach((n) => {
        let name = parent ? parent + '/' + n[0] : n[0];
        if (n[1].items) {
            flatten(n[1], name, res);
        } else {
            if (n[1].data)
                res[name] = n[1].data;
        }
    })

    return res;
}

function resolve(path: string): string | null {
    return null;
}

function applyChangesets(changesets: FileChangeset[]) {
    store.update((s) => {
        // Pre-flight checks
        const prefix = get(activeProject);
        if (prefix === null) return s;

        changesets.forEach((cs) => {
            if (!cs.key.startsWith(prefix)) return s;

            switch (cs.type) {
                case "added":
                case "modified":
                    {
                        // Populate nested tree
                        let treeComponents = cs.key.slice(prefix.length).split('/').filter((c) => (c.length > 0));


                        let n = s;  // Root node REF
                        for (let i = 0; i < treeComponents.length; i++) {
                            if (n.items === undefined) n.items = {};

                            // Populate child if missing
                            if (n.items[treeComponents[i]] === undefined) n.items[treeComponents[i]] = {};
                            n = n.items[treeComponents[i]];  // by REF
                        }

                        // Populate final node data
                        n.data = {
                            dependencies: cs.includes ? cs.includes : [],
                        };

                        break;
                    }
            }
        })

        return s;
    });
}

/*-------------------------------- Exports -----------------------------------*/

export default {
    set: store.set,
    subscribe: store.subscribe,
    update: store.update,
    init,
    reset,
    flatten,
    applyChangesets,
};
