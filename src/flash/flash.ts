import { FlashElement, Props, TEXT_ELEMENT, Fiber, DOMNode, EFFECT, tagsToString } from './types';

const Flash = {
    createElement,
    createTextElement,
    render
};

let currentRoot: Fiber = null;
let wipRoot: Fiber = null;

/* 
This method takes in the new element, and container DOM node, and triggers the reconciliation of the old fibers.
*/
function render(element: FlashElement, container: DOMNode): void{
    
    // If this is first render or the container dom has changed, re initialize the rootFiber.
    const rootElement = createElement('ROOT', {key: 0}, [element]);
    wipRoot = {
        type: rootElement.type,
        dom: container,
        props: rootElement.props,
        children: [],
        index: 0,
        alternate: currentRoot,
        tags: EFFECT.NONE,
        deletions: []
    }
    
    if(currentRoot && currentRoot.dom !== container){
        wipRoot.alternate = currentRoot = null;
    }
    
    let nextFiber = wipRoot;
    while(nextFiber){
        nextFiber = reconcileFiber(nextFiber);
    }
    
    commitRoot();
    currentRoot = wipRoot;
    wipRoot = wipRoot.alternate;
    
}

function commitRoot(){
    
    let nextFiber = wipRoot;
    while(nextFiber){
        nextFiber = commitWork(nextFiber);
    }
    
}

function commitWork(fiber: Fiber): Fiber{
    
    if(fiber.deletions.length > 0){
        fiber.deletions.forEach(domEle => fiber.dom.removeChild(domEle));
    }
    
    if(fiber.tags & EFFECT.UPDATE){
        updateProps(fiber.dom, fiber.props);
        fiber.tags &= ~EFFECT.UPDATE;
    }
    
    if(fiber.tags & EFFECT.SHIFT){
        let nextSiblingDOM = getNextSiblingDOM(fiber);
        if(nextSiblingDOM != null){
            fiber.parent.dom.insertBefore(fiber.dom, nextSiblingDOM);
        }
        else{
            fiber.parent.dom.appendChild(fiber.dom);
        }
        fiber.tags &= ~EFFECT.SHIFT;
    }
    
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
    children: {?} --> iterate over props.children (new elements), copy child fibers from alternateFiber.children where key and type matches,
    set alternate: alternateFiber.children[key] for them, so we can keep comparing for child. If props dont match, set EFFECT.UPDATE.
    Set EFFECT.SHIFT tags for existing children as per the greedy algorithm. And create new fiber for others, set alternate: null, EFFECT.SHIFT, EFFECT.UPDATE.
}
*/
function reconcileFiber(fiber: Fiber): Fiber{
    
    let childElements = fiber.props.children;
    let oldChildFibers = fiber.alternate?.children ?? [];
    
    // Set effect tags for child fibers that exist in element, and create new child fibers for new child elements.
    let previousSibling: Fiber = null;
    fiber.child = null;
    
    let lastPlacedIdx = 0;
    
    childElements.forEach( (childElement, idx) => {
        
        // Create fiber if needed and set SHIFT, UPDATE tags appropriately.
        let key = childElement.props.key;
        if(key in oldChildFibers && oldChildFibers[key].type === childElement.type){
            
            fiber.children[key] = {
                type: oldChildFibers[key].type,
                props: childElement.props,
                dom: oldChildFibers[key].dom,
                alternate: oldChildFibers[key],
                tags: EFFECT.NONE,
                deletions: []
            }
            
            let {children: _, ...oldProps} = oldChildFibers[key].props;
            let {children: __, ...newProps} = childElement.props;
            
            if (JSON.stringify(oldProps) !== JSON.stringify(newProps)){
                fiber.children[key].tags |= EFFECT.UPDATE;
            }
            
            if(oldChildFibers[key].index >= lastPlacedIdx){
                lastPlacedIdx = oldChildFibers[key].index;
            }
            else{
                fiber.children[key].tags |= EFFECT.SHIFT;
            }
        }
        else{
            fiber.children[key] = {
                type: childElement.type,
                props: childElement.props,
                dom: createDomNode(childElement.type, childElement.props),
                alternate: null,
                tags: EFFECT.SHIFT,
                deletions: []
            }
            if(key in oldChildFibers){
                fiber.deletions.push(oldChildFibers[key].dom);
                // do something to delete oldChildFiber variables recursively
                // deleteChildren(oldChildFibers[key]);
                delete oldChildFibers[key];
            }
        };
        
        fiber.children[key].index = idx;
        fiber.children[key].parent = fiber;
        fiber.children[key].children = [];
        
        // Update chid, sibling, parent and index properties
        if(idx == 0){
            fiber.child = fiber.children[key];
            previousSibling = fiber.children[key];
        }
        else{
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
            fiber.deletions.push(oldChildFibers[key].dom);
            // do something to delete oldChildFiber variables recursively
            // deleteChildren(oldChildFibers[key]);
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

/* 
This method takes in a FlashElement and returns a DOM node with props value set other than children.
*/
function createDomNode(type: string, props: Props): DOMNode{
    const elementNode: DOMNode = type === TEXT_ELEMENT ? document.createTextNode("") : document.createElement(type);
    updateProps(elementNode, props);
    return elementNode;
}

/* 
This method takes in dom node and props set all props from dom element other than children.
*/
function updateProps(domNode: DOMNode, props: Props){
    for(var propName in props){
        if(propName == 'children') continue;
        domNode[propName] = props[propName];
    }
}

/* 
This method returns the next sibling which has an existing DOM node on current DOM, placed in correct position.
*/
function getNextSiblingDOM(fiber: Fiber): DOMNode | null{
    
    let nextFiber = fiber.sibling;
    while(nextFiber && (nextFiber.tags & EFFECT.SHIFT)){
        nextFiber = nextFiber.sibling;
    }
    return nextFiber?.dom ?? null;
    
}

export default Flash;