import {Link, useNavigate} from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../asserts/logo.png";

const Home =()=>{
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); 

    useEffect(()=>
    {
        const fetchBlocks= async()=>{
            try{
                const response=await fetch("http://localhost:5057/api/tests");
                const data=await response.json();

                const uniqueBlocks=[...new Map(data.map(item=>[item.block,{block:item.block,nameBlock:item.nameBlock}])).values()];
                setBlocks(uniqueBlocks);
            } catch(error)
            {
                console.error("Ошибка загрузки тестов", error);
            }
            finally{
                setLoading(false);
            }
        };

        fetchBlocks();
    },[]);

    if(loading)
    {
        return<div>Загрузка тестов...</div>;
    }

    return(
        <div className=" min-h-screen bg-gradient-to-b from-blue-100 to-green-100 p-6 relative flex items-center justify-center">
            <img
            src={logo}
            alt="БАРС Груп"
            className="absolute top-4 right-4 w-16 h-16 object-contain"
            />
          <div className="bg-white/70 backdrop-blur-md shadow-xl rounded-2xl p-6  max-w-md text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Добро пожаловать!</h1>
            <p className="text-gray-600 mb-6">Выберите тест</p>
            {blocks.map((block)=>(
                  <div
            key={block.block}
            className="p-6 bg-blue-400 text-white rounded-lg shadow-md cursor-pointer hover: bg-blue-600 transition mb-4"
            onClick={()=>navigate(`/test/${block.block}`)}
            >
                <h2 className="text-xl font-semibold">{block.nameBlock}</h2>
            </div>
            ))}
          
          </div> 
        </div>
    );
};

export default Home;