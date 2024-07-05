import { Filter, PageProperty } from '../types';
import Property from './Property';

export default class RichTextProperty extends Property<string> {
    protected _filter(value: string): Filter {
        return {
            property: this.name,
            rich_text: value ? { equals: value } : { is_empty: true },
        };
    }

    mapValue(value: string): PageProperty {
        return { rich_text: [{ text: { content: value } }] };
    }

    mapPageProperty(pageProperty: PageProperty): string | undefined {
        return pageProperty.rich_text
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
