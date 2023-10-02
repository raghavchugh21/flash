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
    dom: DOMNode
    deletions: DOMNode[]
    index?: number,
    tags?: number
    parent?: Fiber
    child?: Fiber
    sibling?: Fiber
    prev?: Fiber
    alternate?: Fiber
}

export enum EFFECT {
    NONE = 1,
    UPDATE = 2,
    SHIFT = 4
}

export function tagsToString(tags: EFFECT) {
    let tagList = ['NONE', 'UPDATE', 'SHIFT'];
    
    let str = "";

    for(let b = 0; b < tagList.length; b++){
        if(tags & (1<<b)) str += tagList[b] + " ";
    }
    return str;
}