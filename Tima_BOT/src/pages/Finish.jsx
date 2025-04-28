import { useParams, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";


const Finish =()=>{
    const{id}=useParams();
    const location = useLocation();
    const totalQuestions = location.state?.totalQuestions || 0;
    const navigate=useNavigate();
    const handleBack=()=>{
        navigate('/');
    };


    return (
        <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-100 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 text-center">
            <h1 className="text-3xl font-bold text-green-700 mb-6">Поздравляем!</h1>
            <p className="text-lg text-gray-700 mb-8">
              Вы прошли тест. Ваш результат: <span className="font-semibold text-red-600">{id}</span> из {totalQuestions}.
            </p>
            <button
              onClick={handleBack}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-lg transition"
            >
              Вернуться на главную
            </button>
          </div>
        </div>
      );
    }      

export default Finish;