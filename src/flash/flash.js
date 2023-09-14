export function createElement(type, props, children){

    return {
        type: type,
        props: {
            ...props,
            children: children.map(child => typeof child === "object" ? child : createTextElement(props, child))
        }
    }
}

export function createTextElement(props, text){

    return {
        type: 'TEXT_ELEMENT',
        props: {
            ...props,
            children: [],
            nodeValue: text
        }
    }

}

export function render(element, containerNode){

    const elementNode = element.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(element.type);

    for(var propName in element.props){
        if(propName == 'children') continue;
        elementNode[propName] = element.props[propName];
    }

    console.log(element);

    element.props.children.forEach(childElement => {
        render(childElement, elementNode)
    });

    containerNode.appendChild(elementNode);

}