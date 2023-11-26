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

/*--------------------------------- State ------------------------------------*/

const store: Writable<string[]> = writable([]);

const activeProject: Writable<string | null> = writable(null);

/*------------------------------- Functions ----------------------------------*/

/*-------------------------------- Exports -----------------------------------*/

export default store;

export { activeProject };
