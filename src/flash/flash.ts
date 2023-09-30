import { FlashElement, Props, TEXT_ELEMENT, Fiber, DOMNode } from './types';

const Flash = {
    createElement,
    createTextElement,
    render
};

/* 
    This method takes in the type of DOM element and child elements, and return a FlashElement for it.
*/
function createElement(type: string, props: {[key: string]: any}, children: (FlashElement|string)[]): FlashElement{

    return {
        type: type,
        props: {
            key: type == 'ROOT' ? 0 : undefined,
            ...props,
            children: children.map((child, idx) => {
                let childElement = (typeof child == 'string') ? createTextElement({}, child) : (child);
                childElement.props.key = childElement.props.key ?? idx;
                return childElement;
            })
        }
    }
}

/* 
    This method takes in the props and text value, and return a FlashElement of type TEXT_ELEMENT for it.
*/
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

let currentRoot: Fiber = null;
let wipRoot: Fiber = null;

/* 
    This method takes in the new element, and container DOM node, and triggers the reconciliation of the old fibers.
*/
function render(element: FlashElement, container: DOMNode): void{

    // If this is first render or the container dom has changed, re initialize the rootFiber.
    const rootElement = {type: 'ROOT', props: {key: 0, children: [element]}};
    wipRoot = {
        type: rootElement.type,
        dom: container,
        props: rootElement.props,
        children: [],
        index: 0,
        alternate: currentRoot,
        effectTag: (currentRoot?.dom === container) ? 'SAME' : 'ADD'
    }

    if(wipRoot.effectTag == 'ADD'){ wipRoot.alternate = currentRoot = null; }
    
    let nextFiber = wipRoot;
    while(nextFiber){
        nextFiber = reconcileFiber(nextFiber);
    }

    currentRoot = wipRoot;
    wipRoot = wipRoot.alternate;

}

/* 
    This method reconciles the new fibers with new react elements and appends any required changes to the dom.
    
    RECONCILE - NEW FIBER (WITH NEW ELEMENTS) ~ WITH ~ OLD FIBER (WITH OLD ELEMENTS)
    
    alternateFiber{
        type: oldElement.type
        props: oldElement.props
        children: { oldChildKey1: oldChildFiber1, oldChildKey2: oldChildFiber2, ... }
    }
    
    newFiber{
        type: newElement.type
        props: newElement.props (also means props.children will have new child elements)
        children: {?} --> iterate over props.children, copy fiber from alternateFiber.children where key and type matches,
        set alternate: alternateFiber.children[key] for them, so we can keep comparing for child. If props dont match, update props.
        If new element index and old child fiber index don't match, set shiftTag: true. Create new fiber for others, set alternate: null.
    }
*/
function reconcileFiber(fiber: Fiber): Fiber{

    if(fiber.parent){
        if(fiber.effectTag === 'ADD' || fiber.shiftTag){
            let nextDomNode = fiber.prev == null ? fiber.parent.dom.firstChild: fiber.prev.dom.nextSibling;
            (nextDomNode != null ? console.log(`appending `, fiber.dom,` before `, nextDomNode) : console.log(`appending `, fiber.dom,` to end`))
            fiber.parent.dom.insertBefore(fiber.dom, nextDomNode);
        }
        else if(fiber.type == TEXT_ELEMENT && fiber.effectTag === 'UPDATE'){
            updateProps(fiber.dom, fiber.props);
        }
    }

    console.log(fiber.effectTag, " ", fiber.dom, `${(fiber.shiftTag && "shifted")||""}`);
    
    let childElements = fiber.props.children;
    let oldChildFibers = fiber.alternate?.children ?? [];

    // Set effect tags for child fibers that exist in element, and create new child fibers for new child elements.
    let previousSibling: Fiber = null;
    fiber.child = null;
    
    childElements.forEach( (childElement, idx) => {
        
        // Create fiber if needed and place SAME, UPDATE or ADD tags. Update shift tag.
        let key = childElement.props.key;
        if(key in oldChildFibers){
            if(oldChildFibers[key].type === childElement.type){

                fiber.children[key] = {
                    type: oldChildFibers[key].type,
                    props: childElement.props,
                    dom: oldChildFibers[key].dom,
                    alternate: oldChildFibers[key]
                }

                let {children: _, ...oldProps} = oldChildFibers[key].props;
                let {children: __, ...newProps} = childElement.props;

                fiber.children[key].effectTag = JSON.stringify(oldProps) == JSON.stringify(newProps) ? 'SAME' : 'UPDATE';
                fiber.children[key].shiftTag = oldChildFibers[key].index != idx;

            }
        }
        else{
            fiber.children[key] = {
                type: childElement.type,
                props: childElement.props,
                dom: createDomNode(childElement.type, childElement.props)
            };
            fiber.children[key].effectTag = 'ADD';
        }

        fiber.children[key].index = idx;
        fiber.children[key].parent = fiber;
        fiber.children[key].children = [];

        // Update chid, sibling, parent and index properties
        if(idx == 0){
            fiber.child = fiber.children[key];
            previousSibling = fiber.children[key];
            fiber.children[key].prev = null;
        }
        else{
            fiber.children[key].prev = previousSibling;
            previousSibling.sibling = fiber.children[key];
            previousSibling = fiber.children[key];
        }
    });

    if(previousSibling != null){
        previousSibling.sibling = null;
    }

    // Delete old child fibers that don't exist in the element now.
    oldChildFibers.forEach(oldChildFiber => {
        let key = oldChildFiber.props.key;
        if(!(key in fiber.children)){
            removeChildFiber(oldChildFibers[key]);
            delete oldChildFibers[key];
        }
    });

    // Return nextFiber
    let nextFiber = fiber;
    if(nextFiber.child){
        return nextFiber.child;
    }
    while(!nextFiber.sibling && nextFiber.parent){
        nextFiber = nextFiber.parent;
    }
    return nextFiber.sibling

}

/* 
    This method takes in a FlashElement and returns a DOM node with props value set other than children.
*/
function createDomNode(type: string, props: Props): DOMNode{
    const elementNode: DOMNode = type === TEXT_ELEMENT ? document.createTextNode("") : document.createElement(type);
    updateProps(elementNode, props);
    return elementNode;
}

function updateProps(domNode: DOMNode, props: Props){
    for(var propName in props){
        if(propName == 'children') continue;
        domNode[propName] = props[propName];
    }
}

function removeChildFiber(childFiber: Fiber){
    childFiber.effectTag = 'DELETE';
    if(childFiber.dom){
        console.log(childFiber.effectTag, " ", childFiber.dom);
        console.log(`removing`, childFiber.dom,` from `, childFiber.parent.dom);
        childFiber.parent.dom.removeChild(childFiber.dom);
    }
}

export default Flash;