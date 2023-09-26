import Flash from "./flash/flash";

function App(){
    return (
        Flash.createElement('div', {},
                                        [Flash.createElement('ul', {}, 
                                                                        [
                                                                            Flash.createElement('li', {key: 1}, ['Item 1']),
                                                                            Flash.createElement('li', {key: 2}, ['Item 2']),
                                                                            Flash.createElement('li', {key: 3}, ['Item 3'])
                                                                        ]
                                        )]
        )
    );
}

const root = document.getElementById('root');

if(!root){
    throw("Root is not defined");
}
//setInterval(() => {
    Flash.render(App(), root);
//}, 1000);
