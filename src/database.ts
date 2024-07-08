import { type Client, collectPaginatedAPI, isFullPage } from '@notionhq/client';
import type {
    PageObjectResponse,
    QueryDatabaseParameters,
} from '@notionhq/client/build/src/api-endpoints';

import type { Schema } from './schema';
import type { Identificable, SearchParameters } from './types';

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

        const response = await collectPaginatedAPI(
            this._client.databases.query,
            queryParameters,
        );
        const pages = response.filter(isFullPage);

        return this._mapPages(pages);
    }

    async create(models: Array<Model>): Promise<Array<Identificable<Model>>> {
        const pages = await Promise.all(
            models.map((model) =>
                this._client.pages.create({
                    parent: { database_id: this._databaseId },
                    properties: this._schema.getPropertiesFrom(
                        model,
                    ) as Page['properties'],
                }),
            ),
        );

        return this._mapPages(pages.filter(isFullPage));
    }

    async update(
        models: Array<Identificable<Model>>,
    ): Promise<Array<Identificable<Model>>> {
        const pages = await Promise.all(
            models.map((model) =>
                this._client.pages.update({
                    page_id: model.id,
                    properties: this._schema.getPropertiesFrom(
                        model,
                    ) as Page['properties'],
                }),
            ),
        );

        return this._mapPages(pages.filter(isFullPage));
    }

    async delete(
        models: Array<Identificable<Model>>,
    ): Promise<Array<Identificable<{}>>> {
        const blocks = await Promise.all(
            models.map((model) =>
                this._client.blocks.delete({
                    block_id: model.id,
                }),
            ),
        );

        return blocks.map((block) => ({ id: block.id }));
    }
}
