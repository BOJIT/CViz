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

const includeRootNodes: Set<Tree> = new Set();

/*-------------------------------- Helpers -----------------------------------*/

/**
 * Walk tree in breadth-first order and perform an arbitrary function
 * @param t Tree node
 * @param func function to execute
 * @returns void
 */
function treeWalk(t: Tree, func: (n: Tree) => void): void {
    func(t);    // Perform passed function

    if (!t.nodes) return;
    Object.entries(t.nodes).forEach((n) => {
        treeWalk(n[1], func);
    })
}

/*------------------------------- Functions ----------------------------------*/

/**
 * Initialise the store
 * @returns Instance of the store (async)
 */
async function init(): Promise<Writable<Tree>> {

    // Assignments to the store always trigger a full recompute of derived state.
    // Store updates should be considered an expensive operation
    // store.subscribe((t) => {
    //     includeRootNodes.clear();
    //     treeWalk(t, (n: Tree) => {
    //         if (n.ui.include) includeRootNodes.add(n);
    //     });
    // });
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
 * @param t Top level tree component (when not calling recursively)
 * @param parent parent node string
 * @param res Result of previous recursion
 * @returns a flattened tree
 *
 * @note by default children of ignored nodes are not parsed
 */
function flatten(t: Tree, parent?: string, res: FlattenedTree = {}): FlattenedTree {
    if (t.data || t.ui.ignore) return res;

    Object.entries(t.nodes).forEach((n) => {
        let name = parent ? parent + '/' + n[0] : n[0];
        if (n[1].nodes) {
            flatten(n[1], name, res);
        } else {
            res[name] = n[1].data;
        }
    })

    return res;
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
    console.log(u);
    switch (u.event) {
        case "expansion":
            // No update action needs to be taken
            break;

        case "include":
            // Check if node should be in include root list
            if (u.tree.ui.include) includeRootNodes.add(u.tree);
            else includeRootNodes.delete(u.tree);
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
 * @returns a flattened path to a tree node (if found by the resolver)
 * or null on failure to find.
 */
function resolve(path: string, tree: FlattenedTree, currentPath?: string): string | null {
    // Try relative to current path
    if (`${currentPath}/${path}` in tree)
        return `${currentPath}/${path}`;

    // TODO This is messy. Fix later
    const searchPaths: string[] = [];
    includeRootNodes.forEach((s) => {
        searchPaths.push(flattenKey(s));
    })

    // Try the include roots (in alphabetical order)
    let matches = searchPaths?.map((p) => p.replace(/\/$/, ""))
        .filter((p) => (`${p}/${path}` in tree)).map((p) => `${p}/${path}`);
    if (matches?.length) return matches[0];

    // Try from the root
    if (path in tree)
        return path;

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

                            // Populate child if missing (initialise defaults)
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
    flatten,
    flattenKey,
    unflattenKey,
    handlePartialUpdate,
    resolve,
    applyChangesets,
};

export { selectedNode, includeRootNodes };
