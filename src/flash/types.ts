export const TEXT_ELEMENT = 'TEXT_ELEMENT';

export type Props = {
    children: FlashElement[]
    nodeValue?: string
} & {
    [attribute: string]: any
}

export interface FlashElement {
    type: string
    props: Props
}

