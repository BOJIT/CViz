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

        let nameCandidate = root.substring(root.lastIndexOf('/') + 1);
        let duplicateKeys = Object.entries(s).filter(([k, v]) => v.shortName === nameCandidate);

        console.log(duplicateKeys);

        s[root] = {
            // TODO ensure that shortName doesn't clash with any other keys
            shortName: nameCandidate,
        };
        return s;
    });

    return keyExists;
}

function find(shortName: string): string | null {
    return null;
}

function remove(shortName: string) {

}

/*-------------------------------- Exports -----------------------------------*/

export default {
    set: store.set,
    subscribe: store.subscribe,
    update: store.update,
    init,
    reset,
    add,
    find,
    remove,
};

export { activeProject };
