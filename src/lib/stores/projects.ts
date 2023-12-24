/**
 * @file projects.ts
 * @author James Bennion-Pedley
 * @brief Store of accessible project handles (Filesystem Access API)
 * @date 07/02/2023
 *
 * @copyright Copyright (c) 2023
 *
 */

/*-------------------------------- Imports -----------------------------------*/

import { writable, type Writable } from "svelte/store";

import localForage from "localforage";

import tree from '$lib/stores/tree';
import { initialiseTreeWatcher, readConfigFile } from "$lib/utils/commands";
import { loadingOverlay } from "$lib/stores/overlays";

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

        // Clear out the old tree
        tree.reset();

        // Read new config file and load new project
        await readConfigFile(val);
        await initialiseTreeWatcher(val);

        loadingOverlay.set(false);
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

        // TODO deal with Windows paths
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
