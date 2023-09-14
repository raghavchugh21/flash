import { createElement, createTextElement } from "./flash/flash";
import { render } from "./flash/flash";

function App(){
    return (
        createElement('div', {},
                                [createElement('h1', {}, 
                                                        ['Hello World']
                                )]
        )
    );
}

render(App(), document.getElementById('root'));
