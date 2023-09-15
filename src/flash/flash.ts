import { FlashElement, Props, TEXT_ELEMENT } from './types';

const Flash = {
    createElement,
    createTextElement,
    render
};

function createElement(type: string, props: {[key: string]: any}, children: FlashElement[]): FlashElement{

    return {
        type: type,
        props: {
            ...props,
            children: children
        }
    }
}

function createTextElement(props: {[key: string]: any}, text: string): FlashElement{

    return {
        type: TEXT_ELEMENT,
        props: {
            ...props,
            children: [],
            nodeValue: text
        }
    }
}

function render(element: FlashElement, containerNode: HTMLElement){

    const elementNode: any = element.type === TEXT_ELEMENT ? document.createTextNode("") : document.createElement(element.type);
    
    for(var propName in element.props){
        if(propName == 'children') continue;
        elementNode[propName] = element.props[propName];
    }
    
    element.props.children.forEach((childElement) => {
        render(childElement, elementNode)
    });
    
    containerNode.appendChild(elementNode);
}

export default Flash;