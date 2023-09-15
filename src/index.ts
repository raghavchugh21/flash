import Flash from "./flash/flash";

function App(){
    return (
        Flash.createElement('div', {},
                                        [Flash.createElement('h1', {}, 
                                                                        ['Hello World']
                                        )]
        )
    );
}

const root = document.getElementById('root');

if(!root){
    throw("Root is not defined");
}

Flash.render(App(), root);
