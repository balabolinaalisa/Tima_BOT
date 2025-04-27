import { Routes, Route } from "react-router-dom";

import Home from './pages/Home';
import Test from './pages/Test';
import Finish from './pages/Finish';

function App(){
    return(
        <div className="min-h-screen w-full bg-gray-100 p-0 m-0">
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/test/:blockId" element={<Test/>}/>
                <Route path="/finish/:id" element ={<Finish/>}/>
            </Routes>
        </div>
    );
}

export default App;