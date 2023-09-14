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

Flash.render(App(), document.getElementById('root'));
