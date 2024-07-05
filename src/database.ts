import { Client } from '@notionhq/client';
import {
    PageObjectResponse,
    QueryDatabaseParameters,
} from '@notionhq/client/build/src/api-endpoints';

import { Schema } from './schema';
import { Identificable, SearchParameters } from './types';

type Page = PageObjectResponse;

export class Database<Model> {
    constructor(
        private _client: Client,
        private _databaseId: string,
        private _schema: Schema<Model>,
    ) {}

    private _mapPages(pages: Array<Page>): Array<Identificable<Model>> {
        return pages.map((page) => this._schema.mapPage(page));
    }

    async query(
        params: SearchParameters<Model>,
    ): Promise<Array<Identificable<Model>>> {
        const queryParameters: QueryDatabaseParameters = {
            database_id: this._databaseId,
        };

        const filters = this._schema.buildFilterFrom(params);

        if (filters) {
            queryParameters['filter'] = filters;
        }

        const response = await this._client.databases.query(queryParameters);
        const pages = response.results
            .map((result) => result as Page)
            .filter((p) => p.object === 'page');

        return this._mapPages(pages);
    }

    async create(models: Array<Model>): Promise<Array<Identificable<Model>>> {
        const pages = await Promise.all(
            models.map(async (model) => {
                const response = await this._client.pages.create({
                    parent: { database_id: this._databaseId },
                    properties: this._schema.getPropertiesFrom(
                        model,
                    ) as Page['properties'],
                });
                return response as Page;
            }),
        );

        return this._mapPages(pages);
    }

    async update(
        models: Array<Identificable<Model>>,
    ): Promise<Array<Identificable<Model>>> {
        const pages = await Promise.all(
            models.map(async (model) => {
                const response = await this._client.pages.update({
                    page_id: model.id,
                    properties: this._schema.getPropertiesFrom(
                        model,
                    ) as Page['properties'],
                });
                return response as Page;
            }),
        );

        return this._mapPages(pages);
    }

    async delete(
        models: Array<Identificable<Model>>,
    ): Promise<Array<Identificable<{}>>> {
        const blocks = await Promise.all(
            models.map(async (model) => {
                const response = this._client.blocks.delete({
                    block_id: model.id,
                });
                return response;
            }),
        );

        return blocks.map((block) => ({ id: block.id }));
    }
}
