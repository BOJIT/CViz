/**
 * @file +page.ts
 * @author James Bennion-Pedley
 * @brief Redirect releases to GitHub
 * @date 14/04/2024
 *
 * @copyright Copyright (c) 2024
 *
 */

/*-------------------------------- Imports -----------------------------------*/

import { redirect } from '@sveltejs/kit';

/*--------------------------------- State ------------------------------------*/

/*------------------------------- Functions ----------------------------------*/

/*-------------------------------- Exports -----------------------------------*/

export const prerender = false;

// Redirect this route to GitHub releases
export function load({ params }) {
    throw redirect(301, `https://github.com/BOJIT/CViz/releases/${params.slug1}`);
}
