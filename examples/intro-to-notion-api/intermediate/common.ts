import { Client } from '@notionhq/client';
import {
    NumberProperty,
    RichTextProperty,
    Schema,
    TitleProperty,
} from 'dbotion';
import { config } from 'dotenv';

export type Item = {
    name: string;
    price: number;
    lastOrdered: string; // Date
};

config();

export const pageId = process.env.NOTION_PAGE_ID!;
const apiKey = process.env.NOTION_API_KEY;

export const notion = new Client({ auth: apiKey });
export const schema = new Schema<Item>({
    name: new TitleProperty('Grocery item'),
    price: new NumberProperty('Price'), // TODO format: dollar
    lastOrdered: new RichTextProperty('Last ordered'), // TODO date property
});
