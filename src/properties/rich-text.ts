import type { Filter, PageProperty } from '../types';
import { Property } from './property';

export class RichTextProperty extends Property<string> {
    readonly type = 'rich_text';

    protected _filter(value: string): Filter {
        return {
            property: this.name,
            [this.type]: value ? { equals: value } : { is_empty: true },
        };
    }

    mapValue(value: string): PageProperty {
        return { [this.type]: [{ text: { content: value } }] };
    }

    mapPageProperty(pageProperty: PageProperty): string | undefined {
        return pageProperty[this.type]
            ?.map(({ plain_text = '', annotations = {} }) => {
                let text = plain_text;
                if (annotations.bold) text = `**${text}**`;
                if (annotations.code) text = `\`${text}\``;
                if (annotations.italic) text = `*${text}*`;
                if (annotations.strikethrough) text = `~~${text}~~`;
                if (annotations.underline) text = `<u>${text}</u>`;
                return text;
            })
            .join('');
    }
}
