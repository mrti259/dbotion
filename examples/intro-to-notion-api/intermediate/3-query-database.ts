/* 
---------------------------------------------------------------------------
*/
import { isFullDatabase } from '@notionhq/client';
import { Database } from 'dbotion';

import { createDatabase } from './1-create-a-database';
import { addNotionPageToDatabase } from './2-add-page-to-database';
import { Item, notion, pageId, schema } from './common';
import { items } from './sampleData';

async function queryDatabase(database: Database<Item>) {
    console.log('Querying database...');
    // This query will filter database entries and return pages that have a "Last ordered" property that is more recent than 2022-12-31. Use multiple filters with the AND/OR options: https://developers.notion.com/reference/post-database-query-filter.
    const items = await database.query({
        name: ['Tomatoes', 'Lettuce'],
        //lastOrdered: ['2022-12-31'], // TODO after date
    });

    // Print filtered results
    // console.log('Pages with the "Last ordered" date after 2022-12-31:');
    console.log('Pages selected :');
    console.log(items);
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

    // After adding pages, query the database entries (pages)
    queryDatabase(database);
}
