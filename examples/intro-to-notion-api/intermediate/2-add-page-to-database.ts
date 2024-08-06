import { isFullDatabase } from '@notionhq/client';
import { Database } from 'dbotion';

import { createDatabase } from './1-create-a-database.js';
import { Item, notion, pageId, schema } from './common.js';
import { items } from './sampleData.js';

/* 
---------------------------------------------------------------------------
*/

/**
 * Resources:
 * - Create a database endpoint (notion.databases.create(): https://developers.notion.com/reference/create-a-database)
 * - Create a page endpoint (notion.pages.create(): https://developers.notion.com/reference/post-page)
 * - Working with databases guide: https://developers.notion.com/docs/working-with-databases
 */

export function addNotionPageToDatabase(
    database: Database<Item>,
    items: Item[],
) {
    return database.create(items);
}

export async function main() {
    const newDatabase = await createDatabase(pageId);

    if (!isFullDatabase(newDatabase)) return;

    // Print the new database's URL. Visit the URL in your browser to see the pages that get created in the next step.
    console.log(newDatabase.url);

    const databaseId = newDatabase.id;
    // If there is no ID (if there's an error), return.
    if (!databaseId) return;

    console.log('Adding new pages...');
    // Add a few new pages to the database that was just created
    const database = new Database(notion, databaseId, schema);
    await addNotionPageToDatabase(database, items);
}
