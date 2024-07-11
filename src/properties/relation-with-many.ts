import type { Filter, PageProperty } from '../types';
import { Property } from './property';

export class RelationWithManyProperty extends Property<Array<string>> {
    readonly type = 'relation';

    protected _filter(values: Array<string>): Filter {
        return {
            and: values.map((value) => ({
                property: this.name,
                [this.type]: value ? { contains: value } : { is_empty: true },
            })),
        };
    }

    mapValue(values: Array<string>): PageProperty {
        return { [this.type]: values.map((value) => ({ id: value })) };
    }

    mapPageProperty(pageProperty: PageProperty): Array<string> | undefined {
        return pageProperty[this.type]?.map(({ id }) => id!);
    }
}
