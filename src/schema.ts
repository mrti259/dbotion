import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

import type { Property } from './properties';
import type {
    Filter,
    Identificable,
    PageProperty,
    SearchParameters,
} from './types';

type Properties = {
    [name: string]: PageProperty;
};

type SchemaProperties<Model> = {
    [PropertyName in keyof Model]: Property<Model[PropertyName]>;
};

export class Schema<Model> {
    constructor(public properties: SchemaProperties<Model>) {}

    buildFilterFrom(params: SearchParameters<Model>): Filter | null {
        const filters: Filter[] = [];

        for (const propertyName in params) {
            const property = this.properties[propertyName];
            const values = params[propertyName];
            if (!property || !values) continue;
            const filter = property.filter(values);
            if (!filter) continue;
            filters.push(filter);
        }

        if (filters.length === 0) return null;

        return { and: filters } as Filter;
    }

    getPropertiesFrom(model: Partial<Model>): Properties {
        const properties: Properties = {};

        for (const propertyName in model) {
            const property = this.properties[propertyName];
            const value = model[propertyName];
            if (!property || !value) continue;
            properties[property.name] = property.mapValue(value);
        }

        return properties;
    }

    mapPage(page: PageObjectResponse): Identificable<Model> {
        const model = { id: page.id } as Identificable<Model>;
        const properties = page.properties as Properties;

        if (!properties) return model;

        for (const propertyName in this.properties) {
            const property = this.properties[propertyName];
            const pageProperty = properties[property.name] || {};
            model[propertyName] = property.mapPageProperty(pageProperty) as any;
        }

        return model;
    }

    getProperties(): {} {
        const properties = {} as Record<string, unknown>;

        for (const propertyName in this.properties) {
            const property = this.properties[propertyName];
            properties[property.name] = property.emptyObject();
        }

        return properties;
    }
}
