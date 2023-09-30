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
                                                                            Flash.createElement('li', {key: 1}, ['Item 2']),
                                                                            Flash.createElement('li', {key: 3}, ['Item 4']),
                                                                            Flash.createElement('li', {key: 2}, ['Item 3']),
                                                                            Flash.createElement('li', {key: 0}, ['Item 1']),
                                                                        ]
                                        )]
        )
    );
}

function App3(){
    return (
        Flash.createElement('div', {},
                                        [Flash.createElement('ul', {}, 
                                                                        [
                                                                            Flash.createElement('li', {key: 0}, ['Item 1']),
                                                                            Flash.createElement('li', {key: 1}, ['Item 2']),
                                                                            Flash.createElement('li', {key: 2}, ['Item 3']),
                                                                            Flash.createElement('li', {key: 3}, ['Item 4']),
                                                                        ]
                                        )]
        )
    );
}

const root = document.getElementById('root');
const root2 = document.getElementById('root2');

if(!root){
    throw("Root is not defined");
}

// Assuming react can have only one root
setTimeout(() => {
    Flash.render(App1(), root);
}, 0);

setTimeout(() => {
    Flash.render(App2(), root);
}, 1000);

setTimeout(() => {
    Flash.render(App3(), root);
}, 2000);

setTimeout(() => {
    Flash.render(App3(), root2);
}, 3000);

setTimeout(() => {
    Flash.render(App2(), root2);
}, 4000);

setTimeout(() => {
    Flash.render(App1(), root2);
}, 5000);
