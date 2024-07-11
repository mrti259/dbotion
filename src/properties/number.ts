import { Filter, PageProperty } from '../types';
import { Property } from './property';

export class NumberProperty extends Property<number> {
    readonly type = 'number';

    protected _filter(value: number): Filter {
        return {
            property: this.name,
            [this.type]: value ? { equals: value } : { is_empty: true },
        };
    }

    mapValue(value: number): PageProperty {
        return { [this.type]: value };
    }

    mapPageProperty(pageProperty: PageProperty): number {
        return pageProperty[this.type] || 0;
    }
}
