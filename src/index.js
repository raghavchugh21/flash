import React from 'react'
import ReactDOM from 'react-dom/client'

function App(){
    const [showP, setShowP] = React.useState(false);

    React.useEffect(()=>{setTimeout(() => { setShowP(true); }, 5000)}, []);
    return (<div>
                <h1>Hello World</h1>
                {showP && <p>yoyoyo</p>}
            </div>);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);
