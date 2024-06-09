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
    expanded: boolean,
    include: boolean,
    ignore: boolean,
    colour?: string,
};

type NodeData = {
    dependencies: string[],
};

type FlattenedTree = {
    [key: string]: NodeData,
};

type TreeProps = {
    name: string,   // filename
    parent: Tree | null, // Null means we are the top of the tree
    ui: UIState,
};

// A tree entry is either a node (so has data) or a folder (which references nodes)
export type Tree = TreeProps & ({
    data: NodeData,
    nodes?: never,
} | {
    nodes: {
        [key: string]: Tree,    // key is filename
    },
    data?: never,
});

export type TreeUpdate = {
    tree: Tree,
    event: "expansion" | "include" | "ignore" | "colour",
};

/*--------------------------------- State ------------------------------------*/

const DEFAULT_STORE: Tree = {
    name: "root",
    parent: null,
    ui: {
        expanded: true,
        include: true,
        ignore: false,
    },
    nodes: {}
}

const store: Writable<Tree> = writable(structuredClone(DEFAULT_STORE));

const selectedNode: Writable<Tree | null> = writable(null);

/*-------------------------------- Helpers -----------------------------------*/

/**
 * Walk tree in breadth-first order and perform an arbitrary function
 * @param t Tree node
 * @param func function to execute
 * @returns void
 */
// function treeWalk(t: Tree, func: (n: Tree) => void): void {
//     func(t);    // Perform passed function

//     if (!t.nodes) return;
//     Object.values(t.nodes).forEach((n) => {
//         treeWalk(n, func);
//     })
// }

/*------------------------------- Functions ----------------------------------*/

/**
 * Initialise the store
 * @returns Instance of the store (async)
 */
async function init(): Promise<Writable<Tree>> {
    return store;
}

/**
 * Reset the tree store to its default (empty) state
 */
function reset(): void {
    selectedNode.set(null);
    store.set(structuredClone(DEFAULT_STORE));
}

/**
 * @param t Tree node within file tree
 * @returns Flattened tree path (with / separator)
 */
function flattenKey(t: Tree): string {
    let n = t;
    let components = [];
    while (n.parent !== null) {
        components.unshift(n.name);
        n = n.parent;
    }

    return components.join("/");
}

/**
 * @param k Flattened 'Pathlike' key
 * @returns Tree node, or null if it doesn't exist
 */
function unflattenKey(k: string): Tree | null {
    const components = k.split("/");

    let n = get(store); // Get root node
    components.forEach((c) => {
        if (n.nodes && n.nodes[c] !== undefined) {
            n = n.nodes[c];
        } else {
            return null;
        }
    })

    return n;
}

/**
 * Handle small changes to tree: when full re-computation isn't viable
 * @param u Tree Update Event
 */
function handlePartialUpdate(u: TreeUpdate): void {
    switch (u.event) {
        case "expansion":
            // No update action needs to be taken
            break;

        case "include":
            // TEMP: trigger an update
            store.update(s => s);
            break;

        case "ignore":
            // TEMP: Trigger an update
            store.update(s => s);
            break;

        case "colour":
            // TEMP: Trigger an update
            store.update(s => s);
            break;

        default:
            break;
    }
}

/**
 * @param path path of include in C/C++ file
 * @param roots list of tree nodes to try searching from
 * @returns a flattened path to a tree node (if found by the resolver)
 * or null on failure to find.
 */
function resolve(path: string, roots: Tree[] = []): Tree | null {
    const components = path.split("/");

    // Note this will return the first match in order of roots passed in.
    for (const r of roots) {
        let n: Tree = r;
        for (const c of components) {
            if (!n.nodes) break;
            if (!n.nodes[c]) break;
            n = n.nodes[c];
        }
        // If after iteration, we're on a file node, return as resolved
        if (n.data) return n;
    }

    return null;
}

/**
 * Apply changes to the tree based on underlying changes in the filesystem
 * @param changesets Array of changesets to apply
 */
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

                        let t: Tree = s;  // Root node REF
                        let p: Tree | null = null;

                        // Populate intermediate "folder" nodes
                        for (let i = 0; i < treeComponents.length; i++) {
                            // If node is not a folder, exit (should never be called)
                            if (t.data) return;

                            // Create parent 'backlink' reference
                            t.parent = p;

                            // Populate node if missing (initialise defaults)
                            if (t.nodes[treeComponents[i]] === undefined)
                                t.nodes[treeComponents[i]] = {
                                    name: treeComponents[i],
                                    parent: t,
                                    ui: { expanded: false, include: false, ignore: false },
                                    nodes: {}
                                };

                            p = t;  // Make current node the parent by REF
                            t = t.nodes[treeComponents[i]];  // move down into the tree by REF
                        }

                        // Populate final node data (ensure NOT a folder node)
                        t.nodes = undefined;
                        t.data = {
                            dependencies: cs.includes ? cs.includes : [],
                        };

                        break;
                    }

                case "removed":
                    {
                        let treeComponents = cs.key.slice(prefix.length).split('/').filter((c) => (c.length > 0));

                        let n = s;  // Root node REF
                        for (let i = 0; i < treeComponents.length - 1; i++) {
                            if (n.nodes === undefined) return;   // Node doesn't exist

                            n = n.nodes[treeComponents[i]];  // by REF
                            if (n === undefined) return; // Node doesn't exist
                        }

                        // Get last node and delete if present
                        if (n.nodes === undefined) return;
                        delete n.nodes[treeComponents[treeComponents.length - 1]];

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
    flattenKey,
    unflattenKey,
    handlePartialUpdate,
    resolve,
    applyChangesets,
};

export { selectedNode };
