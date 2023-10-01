export const TEXT_ELEMENT = 'TEXT_ELEMENT';

export type DOMNode = HTMLElement | Text;

export type Props = {
    key?: string | number
    children: FlashElement[]
    nodeValue?: string
} & {
    [attribute: string]: any
}

export interface FlashElement {
    type: string
    props: Props
}

export interface Fiber {
    type: string
    props: Props
    children: Fiber[]
    dom: HTMLElement | Text
    index?: number,
    tags?: number
    parent?: Fiber
    child?: Fiber
    sibling?: Fiber
    prev?: Fiber
    alternate?: Fiber
}

export enum EFFECT {
    NONE = 0,
    UPDATE = 2,
    ADD = 4,
    DELETE = 8,
    SHIFT = 16
}

export function tagsToString(tags: EFFECT) {
    let tagList = ['SAME', 'UPDATE', 'ADD', 'DELETE', 'SHIFT'];
    if(tags == 0) return tagList[0];

    let str = "";
    for(let b = 1; b < tagList.length; b++){
        if(tags & (1<<b)) str += tagList[b] + " ";
    }
    return str;
}