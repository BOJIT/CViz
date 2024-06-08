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
    groupColour?: string,
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

/*------------------------------- Functions ----------------------------------*/

async function init(): Promise<Writable<Tree>> {
    return store;
}

function reset(): void {
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
    resolve,
    applyChangesets,
};

export { selectedNode };
