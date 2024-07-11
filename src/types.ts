import type {
    QueryDatabaseParameters,
    RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints';

export type Id = string;

export type Identificable<Model> = { id: Id } & Model;

export type SearchParameters<Model> = {
    [Key in keyof Model]?: Array<Model[Key]>;
};

export type Filter = QueryDatabaseParameters['filter'];

type RecursivePartial<Model> = {
    [Key in keyof Model]?: Model[Key] extends Array<infer Item>
        ? Array<RecursivePartial<Item>>
        : RecursivePartial<Model[Key]>;
};

export type PageProperty = RecursivePartial<{
    title: Array<RichTextItemResponse>;
    rich_text: Array<RichTextItemResponse>;
    relation: Array<Identificable<void>>;
    checkbox: boolean;
    number: number;
}>;
