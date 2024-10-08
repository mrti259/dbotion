import type { Filter, PageProperty } from '../types';

export abstract class Property<TValue> {
    abstract readonly type: keyof PageProperty;

    constructor(public name: string) {}

    filter(values: TValue[]): Filter {
        const filters = { or: values.map((value) => this._filter(value)) };
        return filters as Filter;
    }

    protected abstract _filter(value: TValue): Filter;

    abstract mapValue(value: TValue): PageProperty;

    abstract mapPageProperty(pageProperty: PageProperty): TValue | undefined;

    emptyObject(): unknown {
        return { [this.type]: {} };
    }
}
