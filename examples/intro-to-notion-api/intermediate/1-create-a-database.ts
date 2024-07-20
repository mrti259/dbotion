import { notion, pageId, schema } from './common';

/* 
---------------------------------------------------------------------------
*/

/**
 * Resources:
 * - Create a database endpoint (notion.databases.create(): https://developers.notion.com/reference/create-a-database)
 * - Working with databases guide: https://developers.notion.com/docs/working-with-databases
 */

export function createDatabase(pageId: string) {
    return notion.databases.create({
        parent: {
            type: 'page_id',
            page_id: pageId,
        },
        title: [
            {
                type: 'text',
                text: {
                    content: 'New database name',
                },
            },
        ],
        properties: schema.getProperties(),
    });
}

export async function main() {
    // Create a new database
    const newDatabase = createDatabase(pageId);

    // Print the new database response
    console.log(newDatabase);
}
