import { Client } from '@notionhq/client';

import { Database } from '../src/database';
import { TitleProperty } from '../src/properties';
import { Schema } from '../src/schema';
import { DB_ID, TOKEN } from './constants';
import { assert, createTestSuite } from './utils';

const [test] = createTestSuite('Database');

type Model = typeof model;
const model = {
    name: 'Created',
};
const schema = new Schema<Model>({
    name: new TitleProperty('Name'),
});

let database: Database<Model>;

test.before(async () => {
    const client = new Client({ auth: TOKEN });
    database = new Database(client, DB_ID, schema);
    await deleteAll();
});

test('Query empty database', async () => {
    const results = await queryAll();
    assert(results.length === 0);
});

test('Create page', async () => {
    await create(model);
    const results = await queryAll();
    assert(results.length === 1);

    const { id, ...createdPage } = results[0];
    assert.deepEqual(createdPage, model);
});

test('Delete page', async () => {
    const results = await queryAll();
    assert(results.length === 0);
});

test('Update page', async () => {
    const [createdPage] = await create(model);
    await database.update([
        {
            ...createdPage,
            name: 'Updated',
        },
    ]);
    const results = await queryAll();
    assert(results.length === 1);

    const { id, ...updatePage } = results[0];
    assert.notDeepEqual(updatePage, model);
});

//#region utils
function queryAll() {
    return database.query({ name: [] });
}

function create(obj: Model) {
    return database.create([obj]);
}

async function deleteAll() {
    const results = await queryAll();
    return await database.delete(results);
}
//#endregion
