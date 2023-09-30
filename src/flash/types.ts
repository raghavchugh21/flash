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
    effectTag?: string
    shiftTag?: boolean,
    parent?: Fiber
    child?: Fiber
    sibling?: Fiber
    prev?: Fiber
    alternate?: Fiber
}

