function createElement(type, props, children){

    return {
        type: type,
        props: {
            ...props,
            children
        }
    }

}

function createTextNode(props, text){

    return {
        type: 'TEXT_ELEMENT',
        props: {
            ...props,
            nodeValue: text
        }
    }

}