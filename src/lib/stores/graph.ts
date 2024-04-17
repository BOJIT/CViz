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
import tree from "$lib/stores/tree";

/*--------------------------------- Types ------------------------------------*/

interface Node extends SimulationNodeDatum {
    id: string;
    group: number;

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
}

/*--------------------------------- State ------------------------------------*/

const DEFAULT_STORE: Graph = {
    nodes: [],
    links: [],
};

const store: Readable<Graph> = derived([config, tree], ([c, t], set, update) => {
    update((g) => {
        // Create "flattened version" of tree where each node is a top-level key
        let f = tree.flatten(t);
        let newLinks: Link[] = [];

        // Prune out all ignored nodes
        Object.keys(f).forEach((k) => {
            c.ignoreList?.forEach((i) => {
                // Currently this only uses paths relative to the root
                // TODO add regex support?
                if (k in f && k.startsWith(i)) {
                    delete f[k];
                    return;
                }
            });
        });

        // Add new/updated nodes to graph
        Object.entries(f).forEach((n) => {
            let sourceNode: Node | undefined = undefined;
            if (!g.nodes.some((s: Node) => s.id === n[0])) {
                sourceNode = {
                    id: n[0],
                    group: n[0].endsWith(".h") ? 2 : 1,
                };
                g.nodes.push(sourceNode);
            }

            // Resolve dependencies
            n[1].dependencies?.forEach((i) => {
                let target = tree.resolve(
                    i,
                    f,
                    n[0].slice(0, n[0].lastIndexOf("/")),
                    c.includeRoots,
                );

                if (target === null) return; // TODO mark stdlib

                let link = { source: target, target: n[0], value: 5 };
                newLinks.push(link);
            });
        });

        // Prune any nodes no longer present
        g.nodes = g.nodes.filter((n) => n.id in f);

        // Update to latest link copy
        g.links = newLinks;

        return g;
    })
}, structuredClone(DEFAULT_STORE));

/*------------------------------- Functions ----------------------------------*/

// Return a list of files that are included by the target file
function getDependencies(id: string): string[] {
    return [];
}

// Return a list of files that include the target file
function getDependents(id: string): string[] {
    return [];
}

/*-------------------------------- Exports -----------------------------------*/

export default {
    subscribe: store.subscribe,
    getDependencies,
};

