/**
 * @file ipc.d.ts
 * @author James Bennion-Pedley
 * @brief Serialised types that are common between front and backend
 * @date 20/12/2023
 *
 * @note Keep in sync with `ipc.rs`
 *
 * @copyright Copyright (c) 2023
 *
 */

/*-------------------------------- Imports -----------------------------------*/

/*--------------------------------- Types ------------------------------------*/

export type FileChangeset = {
    type: "removed" | "renamed" | "added" | "modified",
    key: string,
    includes?: string[]
}

export type UINotification = {
    type: "info" | "warning" | "error",
    title: string,
    message: string,
    timeout?: number,
};

type Group = {
    name: string,
    colour?: string,
    path: string,
};

export type ConfigTree = {
    syntax: number,
    includeRoots?: string[],
    ignoreList?: string[],
    // groups?: Group[]
};

/*-------------------------------- Exports -----------------------------------*/
