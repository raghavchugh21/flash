import Flash from "./flash/flash";

function App(){
    return (
        Flash.createElement('div', {},
                                        [Flash.createElement('h1', {}, 
                                                                        [Flash.createTextElement({}, 'Hello World')]
                                        )]
        )
    );
}

const root = document.getElementById('root');
root && Flash.render(App(), root);
