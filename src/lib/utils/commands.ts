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

import type { ConfigTree } from '$lib/stores/config';

/*--------------------------------- State ------------------------------------*/

/*------------------------------- Functions ----------------------------------*/

async function pickDirectory(): Promise<string> {
    return await invoke('pick_directory');
}

async function initialiseTreeWatcher(root: string): Promise<boolean> {
    // Wait for new tree watcher to start
    return await invoke('initialise_tree_watcher', { root: root });
}

async function writeConfigFile(root: string, config: ConfigTree): Promise<string> {
    return await invoke('write_config_file', { root: root, config: config });
}

async function readConfigFile(root: string): Promise<ConfigTree> {
    return await invoke('read_config_file', { root: root });
}

/*-------------------------------- Exports -----------------------------------*/

export { pickDirectory, initialiseTreeWatcher, readConfigFile, writeConfigFile };
