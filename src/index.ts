import Flash from "./flash/flash";

function App1(){
    return (
        Flash.createElement('div', {},
                                        [Flash.createElement('ul', {}, 
                                                                        [
                                                                            Flash.createElement('li', {}, ['Item 1']),
                                                                            Flash.createElement('li', {}, ['Item 2']),
                                                                            Flash.createElement('li', {}, ['Item 3'])
                                                                        ]
                                        )]
        )
    );
}

function App2(){
    return (
        Flash.createElement('div', {},
                                        [Flash.createElement('ul', {}, 
                                                                        [
                                                                            Flash.createElement('li', {key: 1}, ['Item 1']),
                                                                            Flash.createElement('li', {key: 0}, ['Item 0']),
                                                                            Flash.createElement('li', {key: 2}, ['Item 2'])
                                                                        ]
                                        )]
        )
    );
}

const root = document.getElementById('root');

if(!root){
    throw("Root is not defined");
}

const app = App1();
console.log(app);
Flash.render(app, root);
setTimeout(() => {
    Flash.render(App2(), root);
}, 1000);
