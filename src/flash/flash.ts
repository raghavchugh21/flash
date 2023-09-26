import { FlashElement, Props, TEXT_ELEMENT, Fiber, FiberProps } from './types';

const Flash = {
    createElement,
    createTextElement,
    render
};

function createElement(type: string, props: {[key: string]: any}, children: (FlashElement|string)[]): FlashElement{

    return {
        type: type,
        props: {
            ...props,
            children: children.map(child => ( (typeof child == 'string' ? createTextElement({}, child) : (child) ) ))
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

let rootFiber: Fiber = null;

/* 
    This method takes in the new element, and container DOM node, and triggers the reconciliation of the old fibers.
*/
function render(element: FlashElement, container: HTMLElement): void{

    // If this is first render or the container dom has changed, re initialize the rootFiber.
    if(!rootFiber || rootFiber.dom !== container){
        let childFiber = createFiber(element.type, element.props);
        rootFiber = {
            type: 'ROOT',
            dom: container,
            props: element.props,
            child: childFiber,
            sibling: null,
            parent: null,
            children: [childFiber]
        }
        childFiber.parent = rootFiber;
    }
    reconcileFiber(element, rootFiber.child);

}

function createFiber(type: string, props: FiberProps): Fiber{

    return {
        type: type,
        props: props,
        children: [],
        parent: null,
        child: null,
        dom: null,
        sibling: null
    }

}

function createDomNode(element: FlashElement): HTMLElement | Text{

    const elementNode: HTMLElement | Text = element.type === TEXT_ELEMENT ? document.createTextNode("") : document.createElement(element.type);
    
    for(var propName in element.props){
        if(propName == 'children') continue;
        elementNode[propName] = element.props[propName];
    }
    return elementNode

}

/* 
This method reconciles the old fibers with new react elements and appends any required changes to the dom.
*/
function reconcileFiber(element: FlashElement, fiber: Fiber): void{
    
    // Creates the fibers of children that didn't exist, calls reconcileFiber on children.
    // Create DOM Node for current fiber, apppend it to parent.
    if(!fiber.dom){
        fiber.dom = createDomNode(element);
    }
    
    if(fiber.parent){
        fiber.parent.dom.appendChild(fiber.dom);
    }

    let childElements = element.props.children;
    let oldChildFibers = fiber.children;

    fiber.child = null;
    let previousSibling = null;
    childElements.forEach( (childElement, idx) => {
        childElement.props.key = childElement.props.key ?? idx;
        let key = childElement.props.key;
        if(key in oldChildFibers){
            if(oldChildFibers[key].type === childElement.type){
                // fiber.children[key] = oldChildFibers[key];
                fiber.children[key].props = childElement.props;
            }
        }
        else{
            fiber.children[key] = createFiber(childElement.type, childElement.props);
        }

        if(idx == 0){
            fiber.child = fiber.children[key];
            previousSibling = fiber.children[key];
        }
        else{
            previousSibling.sibling = fiber.children[key];
            previousSibling = fiber.children[key];
        }
        
        fiber.children[key].parent = fiber
    });
    if(previousSibling != null){
        previousSibling.sibling = null;
    }
    
    oldChildFibers.forEach(oldChildFiber => {
        let key = oldChildFiber.props.key;
        let childKeys = Object.fromEntries(childElements.map(childElement => [childElement.props.key, true]));
        if(!(key in childKeys)){
            delete oldChildFibers[key]
        }
    });

    let nextFiber = fiber.child;
    for(let i=0;i<childElements.length;i++){
        reconcileFiber(childElements[i], nextFiber)
        nextFiber = nextFiber.sibling;
    }

}

export default Flash;