/**
 * @file overlays.ts
 * @author James Bennion-Pedley
 * @brief Share app-wide overlay state
 * @date 07/02/2023
 *
 * @copyright Copyright (c) 2023
 *
 */

/*-------------------------------- Imports -----------------------------------*/

import { writable, type Writable } from "svelte/store";

/*--------------------------------- State ------------------------------------*/

const loadingOverlay: Writable<boolean> = writable(false);
const projectOverlay: Writable<boolean> = writable(false);
const settingsOverlay: Writable<boolean> = writable(false);
const themeOverlay: Writable<boolean> = writable(false);

/*------------------------------- Functions ----------------------------------*/

/*-------------------------------- Exports -----------------------------------*/

export {
    loadingOverlay,
    projectOverlay,
    settingsOverlay,
    themeOverlay,
};
