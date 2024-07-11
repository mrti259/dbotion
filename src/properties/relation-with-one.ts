import type { Filter, PageProperty } from '../types';
import { Property } from './property';

export class RelationWithOneProperty extends Property<string> {
    readonly type = 'relation';

    protected _filter(value: string): Filter {
        return {
            property: this.name,
            [this.type]: value ? { contains: value } : { is_empty: true },
        };
    }

    mapValue(value: string): PageProperty {
        return { [this.type]: [{ id: value }] };
    }

    mapPageProperty(pageProperty: PageProperty): string | undefined {
        return pageProperty[this.type]?.[0]?.id;
    }
}
