/**
 * @file projects.ts
 * @author James Bennion-Pedley
 * @brief Store of saved projects (stored in Browser storage)
 * @date 07/02/2023
 *
 * @copyright Copyright (c) 2023
 *
 */

/*-------------------------------- Imports -----------------------------------*/

import { get, writable, type Writable } from "svelte/store";

import localForage from "localforage";

import { message } from "@bojit/svelte-components/core";

import tree, { selectedNode } from '$lib/stores/tree';
import config from "$lib/stores/config";
import { initialiseTreeWatcher, readConfigFile, writeConfigFile } from "$lib/utils/commands";
import { loadingOverlay, projectOverlay } from "$lib/stores/overlays";

/*--------------------------------- Types ------------------------------------*/

type ProjectEntry = {
    shortName: string,
    icon?: string,
}

export type ProjectStore = {
    [key: string]: ProjectEntry,
};

/*--------------------------------- State ------------------------------------*/

const DEFAULT: ProjectStore = {};

const store: Writable<ProjectStore> = writable(DEFAULT);
const localStore: LocalForage = localForage.createInstance({
    name: "projects"
});

const activeProject: Writable<string | null> = writable(null);

/*------------------------------- Functions ----------------------------------*/

async function init(): Promise<Writable<ProjectStore>> {
    // Does local store exist?
    let entry = await localStore.getItem("projects");

    // Get localStorage if it exists
    if (entry !== null)
        store.set(entry as ProjectStore);

    /* Local storage is subscribed to store updates */
    store.subscribe(async (val: ProjectStore) => {
        await localStore.setItem("projects", val);
    });

    // Active project changes trigger a tree watcher re-initialisation
    activeProject.subscribe(async (val: string | null) => {
        if (val === null) return;

        // Show loading scrim
        loadingOverlay.set(true);

        // Deselect focused node and clear out the old tree
        selectedNode.set(null);
        tree.reset();

        // Read new config file and load new project
        try {
            const configData = await readConfigFile(val);
            console.log(configData);

            // TODO update the tree information based on active project

            await initialiseTreeWatcher(val);
        } catch (error) {
            // Return to selector if the directory doesn't exist!
            message.push({
                "title": "Directory doesn't exist!",
                "message": "Project no longer exists on disk.",
                "type": "error",
                "timeout": 10,
            });

            activeProject.set(null);
            projectOverlay.set(true);
        }

        loadingOverlay.set(false);
    });

    // Project config files are written back to disk on changes.
    config.subscribe(async (c) => {
        let p = get(activeProject);
        if (p === null) return;

        // Note this will result in one redundant write-back on project changes
        await writeConfigFile(p, c);
    });

    return store;
}

async function reset(): Promise<void> {
    await localStore.clear();
    store.set(DEFAULT);          // Reset all stores
}

function add(root: string): boolean {
    let keyExists = false;

    store.update((s) => {
        if (s[root] !== undefined)
            keyExists = true;

        let shortName = root.substring(root.lastIndexOf('/') + 1);


        s[root] = {
            shortName: shortName,
        };
        return s;
    });

    return keyExists;
}

function remove(root: string): boolean {
    let keyExists = false;

    store.update((s) => {
        if (s[root] !== undefined)
            keyExists = true;

        delete s[root];

        return s;
    });

    return keyExists;
}

/*-------------------------------- Exports -----------------------------------*/

export default {
    set: store.set,
    subscribe: store.subscribe,
    update: store.update,
    init,
    reset,
    add,
    remove,
};

export { activeProject };
