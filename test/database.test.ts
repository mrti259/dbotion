import { Client } from '@notionhq/client';

import { Database } from '../src/database';
import {
    CheckboxProperty,
    NumberProperty,
    RichTextProperty,
    TitleProperty,
} from '../src/properties';
import { Schema } from '../src/schema';
import { DB_ID, TOKEN } from './constants';
import { assert, createTestSuite } from './utils';

//#region Utils

type Model = typeof model;

const model = {
    name: 'Created',
    description: 'Testing Create',
    done: false,
    num: (Math.random() * 10) % 10,
};

const schema = new Schema<Model>({
    name: new TitleProperty('Name'),
    description: new RichTextProperty('Description'),
    done: new CheckboxProperty('Done'),
    num: new NumberProperty('Random'),
});

const client = new Client({ auth: TOKEN });

let database: Database<Model>;

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

async function expect(anAmountExpected: number) {
    const results = await queryAll();
    assert.equal(results.length, anAmountExpected);
    return results;
}

//#endregion
//#region Tests

const [test] = createTestSuite('Database');

test.before(async () => {
    database = new Database(client, DB_ID, schema);
    await deleteAll();
});

test('Prepare database', async () => {
    await database.updateSchema();
});

test('Query empty database', async () => {
    await expect(0);
});

test('Create page', async () => {
    await create(model);

    const results = await expect(1);
    const { id, ...createdPage } = results[0]!;
    assert.deepEqual(createdPage, model);
});

test('Delete page', async () => {
    await expect(0);
});

test('Update page', async () => {
    const [createdPage] = await create(model);
    await database.update([
        {
            ...createdPage!,
            name: 'Updated',
            description: 'Testing Update',
            done: true,
            num: (Math.random() * 10) % 10,
        },
    ]);

    const results = await expect(1);
    const { id, ...updatedPage } = results[0]!;
    assert.notDeepEqual(updatedPage, model);
});

//#endregion
