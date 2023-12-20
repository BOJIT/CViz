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

export type FileMetadata = {
    key: string,
}

export type FileChangeset = {
    change_type: "removed" | "renamed" | "added" | "modified",
}

export type UINotification = {
    msg_type: "info" | "warning" | "error",
    title: string,
    message: string,
    timeout: number,
};

/*-------------------------------- Exports -----------------------------------*/
