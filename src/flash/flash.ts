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
        rootFiber = {
            type: 'ROOT',
            dom: container,
            props: {},
            child: null,
            sibling: null,
            parent: null,
            children: [],
            effectTag: 'ADD',
            index: 0
        }
    }
    else{
        rootFiber.effectTag = 'SAME';
    }

    reconcileFiber(createElement('ROOT', {}, [element]), rootFiber);

}

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
        effectTag: null,
        index: null
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
    if(!fiber.parent){
        ;
    }
    else if(!fiber.dom || fiber.effectTag === 'ADD' || (element.type == TEXT_ELEMENT && fiber.effectTag === 'UPDATE' )){
        if(fiber.dom){
            fiber.parent.dom.removeChild(fiber.dom);
        }
        fiber.dom = createDomNode(element);
    }

    if(fiber.parent){
        fiber.parent.dom.appendChild(fiber.dom);
    }

    console.log(fiber.effectTag, " ", fiber.dom);
    
    let childElements = element.props.children;
    let oldChildFibers = fiber.children;

    oldChildFibers.forEach(oldChildFiber => {
        let key = oldChildFiber.props.key;
        let childElementKeys = Object.fromEntries(childElements.map((childElement, idx) => [(childElement.props.key ?? idx), true]));
        if(!(key in childElementKeys)){
            fiber.children[key].effectTag = 'DELETE';
            if(fiber.children[key].dom){
                console.log(fiber.children[key].effectTag, " ", fiber.children[key].dom);
                fiber.dom.removeChild(fiber.children[key].dom);
            }
            delete oldChildFibers[key]
        }
    });

    fiber.child = null;
    let previousSibling: Fiber = null;
    childElements.forEach( (childElement, idx) => {
        childElement.props.key = childElement.props.key ?? idx;
        let key = childElement.props.key;
        if(key in oldChildFibers){
            if(oldChildFibers[key].type === childElement.type){
                // fiber.children[key] = oldChildFibers[key];
                let {children: _, ...oldProps} = fiber.children[key].props;
                let {children: __, ...newProps} = childElement.props;
                if(JSON.stringify(oldProps) == JSON.stringify(newProps)){
                    fiber.children[key].effectTag = 'SAME';
                }
                else{
                    fiber.children[key].effectTag = 'UPDATE';
                    for(var prop in childElement.props){
                        if(prop != 'children')
                            fiber.children[key][prop] = childElement.props[prop];
                    }
                }
            }
        }
        else{
            fiber.children[key] = createFiber(childElement.type, childElement.props);
            fiber.children[key].effectTag = 'ADD';
        }

        if(idx == 0){
            fiber.child = fiber.children[key];
            previousSibling = fiber.children[key];
        }
        else{
            previousSibling.sibling = fiber.children[key];
            previousSibling = fiber.children[key];
        }
        previousSibling.index = idx;
        
        fiber.children[key].parent = fiber
        
        reconcileFiber(childElement, fiber.children[key]);

    });

    // if(previousSibling != null){
    //     previousSibling.sibling = null;
    // }

    // let nextFiber = fiber.child;
    // for(let i=0;i<childElements.length;i++){
    //     reconcileFiber(childElements[i], nextFiber)
    //     nextFiber = nextFiber.sibling;
    // }

}

export default Flash;