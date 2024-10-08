import type { Filter, PageProperty } from '../types';
import { Property } from './property';

export class TitleProperty extends Property<string> {
    readonly type = 'title';

    protected _filter(value: string): Filter {
        return {
            property: this.name,
            title: value ? { equals: value } : { is_empty: true },
        };
    }

    mapValue(value: string): PageProperty {
        return { title: [{ text: { content: value } }] };
    }

    mapPageProperty(pageProperty: PageProperty): string | undefined {
        return pageProperty.title?.map((text) => text.plain_text).join('');
    }
}
