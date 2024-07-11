import { Filter, PageProperty } from '../types';
import { Property } from './property';

export class CheckboxProperty extends Property<boolean> {
    readonly type = 'checkbox';

    protected _filter(value: boolean): Filter {
        return {
            property: this.name,
            [this.type]: { equals: value },
        };
    }

    mapValue(value: boolean): PageProperty {
        return { [this.type]: value };
    }

    mapPageProperty(pageProperty: PageProperty): boolean {
        return pageProperty[this.type] || false;
    }
}
