/**
 * @file graph.ts
 * @author James Bennion-Pedley
 * @brief Store derived from tree which represents the node graph
 * @date 14/04/2024
 *
 * @copyright Copyright (c) 2024
 *
 */

/*-------------------------------- Imports -----------------------------------*/

import { derived, type Readable } from "svelte/store";

import type { SimulationNodeDatum, SimulationLinkDatum } from "d3-force";
import type { GraphData } from "force-graph";

import config from "$lib/stores/config";
import tree, { type Tree } from "$lib/stores/tree";

/*--------------------------------- Types ------------------------------------*/

interface Node extends SimulationNodeDatum {
    // Core properties
    id: string; // This ID is the full path to the node
    group: number;

    // Metadata properties
    node: Tree; // Reference to Tree node that Graph node decends from
    combine?: Tree; // If set, this node is rendered only as the combine node!

    // Inherited properties (don't modify)
    fx?: number;
    fy?: number;
}

interface Link extends SimulationLinkDatum<Node> {
    source: string;
    target: string;
    value: number;
}

export interface Graph extends GraphData {
    nodes: Node[],
    links: Link[],
    treeSet: Set<Tree>          // Cache of previous "Tree Nodes" in Graph
    treeMap: Map<Tree, Node>,   // Incrementally updated "Tree Node Map"
}

/*--------------------------------- State ------------------------------------*/

const DEFAULT_STORE: Graph = {
    nodes: [],
    links: [],
    treeSet: new Set(),
    treeMap: new Map(),
};

const store: Readable<Graph> = derived([config, tree], ([c, t], set, update) => {
    update((g) => {
        // Work out which nodes need to be added to the map and which
        // nodes need to be added.
        const activeNodes: Set<Tree> = new Set();
        const includeNodes: Set<Tree> = new Set();
        collectSets(t, activeNodes, includeNodes);
        const toRemove: Set<Tree> = g.treeSet.difference(activeNodes);
        const toAdd: Set<Tree> = activeNodes.difference(g.treeSet);

        // Prune removed Tree Nodes
        toRemove.forEach((r) => {
            g.treeMap.delete(r);
        });

        // Key computation is only done for new Tree Nodes
        toAdd.forEach((a) => {
            g.treeMap.set(a, {
                id: tree.flattenKey(a),
                group: a.name.endsWith(".h") ? 2 : 1,
                node: a,
            });
        });

        // loop over active treemap and update links
        let newLinks: Link[] = [];
        g.treeMap.forEach((n, t) => {
            if (t.nodes) return;
            if (t.parent === null) return;

            // Resolve node dependencies
            t.data.dependencies?.forEach((inc) => {
                const target = tree.resolve(inc, [t.parent, ...includeNodes]);
                if (target === null) return;
                const source = g.treeMap.get(target);
                // Note that an ignored root may still resolve. We exclude it here
                if (source) {
                    let link: Link = { source: source.id, target: n.id, value: 5 };
                    newLinks.push(link);
                }
            });
        });

        // Cast treemap to array of nodes and replace links
        g.nodes = [...g.treeMap.values()];
        g.links = newLinks;

        // Save active set for next computation
        g.treeSet = activeNodes;

        return g;
    })
}, structuredClone(DEFAULT_STORE));

/*------------------------------- Functions ----------------------------------*/

/**
 * Generate node sets. This strips out any 'directory' nodes
 * and ignored parts of the tree
 * @param t Root tree node
 * @param nodes set of nodes that is populated on return
 * @returns
 */
function collectSets(t: Tree, nodes: Set<Tree>, includes: Set<Tree>): void {
    if (t.ui.ignore) return;

    if (t.ui.include) includes.add(t);

    if (t.data) {
        nodes.add(t);
    } else {
        Object.values(t.nodes).forEach((n) => {
            collectSets(n, nodes, includes);
        })
    }
}

/*-------------------------------- Exports -----------------------------------*/

export default {
    subscribe: store.subscribe,
};

