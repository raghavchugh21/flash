import { FlashElement, Props, TEXT_ELEMENT, Fiber, FiberProps, DOMNode } from './types';

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

let rootFiber: Fiber = null;

/* 
    This method takes in the new element, and container DOM node, and triggers the reconciliation of the old fibers.
*/
function render(element: FlashElement, container: DOMNode): void{

    // If this is first render or the container dom has changed, re initialize the rootFiber.
    if(!rootFiber || rootFiber.dom !== container){
        rootFiber = {
            type: 'ROOT',
            dom: container,
            props: {key: 0},
            child: null,
            sibling: null,
            parent: null,
            children: [],
            effectTag: 'ADD',
            index: 0,
            shiftTag: false,
            prev: null
        }
    }
    else{
        rootFiber.effectTag = 'SAME';
    }

    reconcileFiber(createElement('ROOT', {key: 0}, [element]), rootFiber);

}

/* 
    This method reconciles the old fibers with new react elements and appends any required changes to the dom.
    In this method, we compare the children of current element and fiber, then:
        1. Remove the fiber children not in element's children. Also, remove their DOM nodes.
        2. For the children with same keys (if no key, use index), compare type. 
           If type is same, then compare props. If props are also same, then place 'SAME' tag on child fiber. Else 'UPDATE' tag.
           Else, place an 'ADD' tag. In this case, you should remove child DOM.
        3. Call reconcileFiber on children on the go, in order of traversing child elements.
*/
function reconcileFiber(element: FlashElement, fiber: Fiber): void{
    
    if(!fiber.dom){
        fiber.dom = createDomNode(element);
    }

    if(fiber.parent){
        if(fiber.effectTag === 'ADD'){
            console.log(`appending`, fiber.dom,` to `, fiber.parent.dom);
            fiber.parent.dom.appendChild(fiber.dom);
        }
        else if(element.type == TEXT_ELEMENT && fiber.effectTag === 'UPDATE'){
            updateProps(fiber.dom, element.props);
        }
        else if(fiber.shiftTag){
            console.log(`inserting`, fiber.dom,` before `, fiber.prev == null ? fiber.parent.dom.firstChild: fiber.prev.dom.nextSibling);
            fiber.parent.dom.insertBefore(fiber.dom, fiber.prev == null ? fiber.parent.dom.firstChild : fiber.prev.dom.nextSibling);
        }
    }

    console.log(fiber.effectTag, " ", fiber.dom, " ", fiber.shiftTag ? "shifted" :  "");
    
    let childElements = element.props.children;
    let childFibers = fiber.children;

    // Delete child fibers that don't exist in the element now.
    let childElementKeysDict = Object.fromEntries(childElements.map((childElement, idx) => [(childElement.props.key ?? idx), true]));
    childFibers.forEach(childFiber => {
        let childFiberKey = childFiber.props.key;
        if(!(childFiberKey in childElementKeysDict)){
            removeChildFiber(childFibers[childFiberKey]);
            delete childFibers[childFiberKey];
        }
    });

    // Set effect tags for child fibers that exist in element, and create new child fibers for new child elements.
    let previousSibling: Fiber = null;
    fiber.child = null;
    
    childElements.forEach( (childElement, idx) => {
        
        // Create fiber if needed and place SAME, UPDATE or ADD tags. Update shift tag.
        let key = childElement.props.key;
        if(key in childFibers){
            if(childFibers[key].type === childElement.type){

                let {children: __, ...newProps} = childElement.props;
                if(JSON.stringify(fiber.children[key].props) == JSON.stringify(newProps)){
                    fiber.children[key].effectTag = 'SAME';
                }
                else{
                    for(var prop in newProps){
                        fiber.children[key].props[prop] = childElement.props[prop];
                    }
                    fiber.children[key].effectTag = 'UPDATE';
                }
                fiber.children[key].shiftTag = fiber.children[key].index != idx;

            }
        }
        else{
            fiber.children[key] = createFiber(childElement.type, childElement.props);
            fiber.children[key].effectTag = 'ADD';
        }

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

        fiber.children[key].parent = fiber
        fiber.children[key].index = idx;
        
        reconcileFiber(childElement, fiber.children[key]);

    });

    if(previousSibling != null){
        previousSibling.sibling = null;
    }
}

/* 
    This method takes in the type of FlashElement and its Props. Returns a fiber node of same type and props (without children).
*/
function createFiber(type: string, props: FiberProps): Fiber{

    let {children: _, ...otherProps} = props;
    return {
        type: type,
        props: otherProps,
        children: [],
        parent: null,
        child: null,
        dom: null,
        sibling: null,
        index: null,
        effectTag: null,
        shiftTag: false,
        prev: null
    }

}

/* 
    This method takes in a FlashElement and returns a DOM node with props value set other than children.
*/
function createDomNode(element: FlashElement): DOMNode{

    const elementNode: DOMNode = element.type === TEXT_ELEMENT ? document.createTextNode("") : document.createElement(element.type);
    
    updateProps(elementNode, element.props);
    
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
        console.log(childFiber.effectTag, " ", childFiber.dom, " ", childFiber.shiftTag);
        console.log(`removing`, childFiber.dom,` from `, childFiber.parent.dom);
        childFiber.parent.dom.removeChild(childFiber.dom);
    }
}

export default Flash;