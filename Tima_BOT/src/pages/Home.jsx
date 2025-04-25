import {Link} from "react-router-dom";
import logo from "../asserts/logo.png";

const Home =()=>{
    return(
        <div className=" min-h-screen bg-gradient-to-b from-blue-100 to-green-100 p-6 relative flex items-center justify-center">
            <img
            src={logo}
            alt="БАРС Груп"
            className="absolute top-4 right-4 w-16 h-16 object-contain"
            />
          <div className="bg-white/70 backdrop-blur-md shadow-xl rounded-2xl p-6  max-w-md text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Добро пожаловать!</h1>
            <p className="text-gray-600 mb-6">Вы готовы приступить к обучению?</p>
            <Link to="/test/1">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full shadow-lg transition">
                Начать обучение
            </button>
            </Link>
            <div className="mt-6 text-sm text-gray-700">
                Тема текущего теста: <span className="font-medium text-blue-600">Навык тайм-менеджмент</span>
            </div>
          </div> 
        </div>
    );
};

export default Home;