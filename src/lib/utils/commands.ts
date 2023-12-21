/**
 * @file commands.ts
 * @author James Bennion-Pedley
 * @brief Handle backend commands that are initialised from the WebView
 * @date 01/12/2023
 *
 * @copyright Copyright (c) 2023
 *
 */

/*-------------------------------- Imports -----------------------------------*/

import { invoke } from '@tauri-apps/api/tauri'

import tree from '$lib/stores/tree';

/*--------------------------------- State ------------------------------------*/

/*------------------------------- Functions ----------------------------------*/

async function pickDirectory(): Promise<string> {
    return await invoke('pick_directory');
}

async function initialiseTreeWatcher(root: string): Promise<boolean> {
    console.log("Re-watch tree: ", root);
    // Clear out the old tree
    tree.reset();

    // Wait for new tree watcher to start
    return await invoke('initialise_tree_watcher', { root: root });
}

/*-------------------------------- Exports -----------------------------------*/

export { pickDirectory, initialiseTreeWatcher };
