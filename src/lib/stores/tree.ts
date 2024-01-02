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

type UIState = {
    expanded?: boolean,
    groupColour?: string,
};

type NodeData = {
    dependencies?: string[],
    ui?: UIState,
};

type FlattenedTree = {
    [key: string]: NodeData,
};

export type NestedTree = {
    data?: NodeData,
    parent?: NestedTree,    // Points up by reference
    items?: {
        [key: string]: NestedTree,
    },
};

/*--------------------------------- State ------------------------------------*/

const store: Writable<NestedTree> = writable({});

const selectedNode: Writable<string | null> = writable(null);

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

/**
 * @param path path of include in C/C++ file
 * @returns a flattened path to a tree node (if found by the resolver)
 * or null on failure to find.
 */
function resolve(path: string, tree: FlattenedTree, currentPath?: string, searchPaths?: string[]): string | null {
    // Try relative to current path
    if (`${currentPath}/${path}` in tree)
        return `${currentPath}/${path}`;

    // Try the include roots (in alphabetical order)
    let matches = searchPaths?.map((p) => p.replace(/\/$/, ""))
        .filter((p) => (`${p}/${path}` in tree)).map((p) => `${p}/${path}`);
    if (matches?.length) return matches[0];

    // Try from the root
    if (path in tree)
        return path;

    return null;
}

function applyChangesets(changesets: FileChangeset[]) {
    store.update((s) => {
        // Pre-flight checks
        const prefix = get(activeProject);
        if (prefix === null) return s;

        changesets.forEach((cs) => {
            if (cs.type === "no_event") return;

            switch (cs.type) {
                case "added":
                case "modified":
                    {
                        if (!cs.key.startsWith(prefix)) return s;

                        // Populate nested tree
                        let treeComponents = cs.key.slice(prefix.length).split('/').filter((c) => (c.length > 0));

                        let n = s;  // Root node REF
                        let p: NestedTree | undefined = undefined;
                        for (let i = 0; i < treeComponents.length; i++) {
                            if (n.items === undefined) n.items = {};

                            // Create parent 'backlink' reference
                            if (p) n.parent = p;

                            // Populate child if missing
                            if (n.items[treeComponents[i]] === undefined) n.items[treeComponents[i]] = {};
                            p = n;  // by REF
                            n = n.items[treeComponents[i]];  // by REF
                        }

                        // Populate final node data
                        n.parent = p;
                        n.data = {
                            dependencies: cs.includes ? cs.includes : [],
                        };

                        break;
                    }

                case "removed":
                    {
                        let treeComponents = cs.key.slice(prefix.length).split('/').filter((c) => (c.length > 0));

                        let n = s;  // Root node REF
                        for (let i = 0; i < treeComponents.length - 1; i++) {
                            if (n.items === undefined) return;   // Node doesn't exist

                            n = n.items[treeComponents[i]];  // by REF
                            if (n === undefined) return; // Node doesn't exist
                        }

                        // Get last node and delete if present
                        if (n.items === undefined) return;
                        delete n.items[treeComponents[treeComponents.length - 1]];

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
    resolve,
    applyChangesets,
};

export { selectedNode };
