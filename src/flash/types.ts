export const TEXT_ELEMENT = 'TEXT_ELEMENT';

export type Props = {
    key?: string | number
    children: FlashElement[]
    nodeValue?: string
} & {
    [attribute: string]: any
}

export type FiberProps = {
    key?: string | number
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
    props: FiberProps
    children: Fiber[]
    parent: Fiber | null
    child: Fiber | null
    sibling: Fiber | null
    dom: HTMLElement | Text
}

