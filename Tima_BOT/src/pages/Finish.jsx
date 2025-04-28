import { useParams, useNavigate } from "react-router-dom";


const Finish =()=>{
    const{id}=useParams();
    const navigate=useNavigate();
    const handleBack=()=>{
        navigate('/');
    };


    return(
        <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-100 flex justify-center items-center">
            <div className="text-center p-8 bg-white bg-opacity-80 rounded-lg shadow-xl max-w-md w-full">
                <h1 className="text-4xl font-bold text-green-700 mb-4">Поздравляем!</h1>
                <p className="text-xl text-gray-700 mb-8"> Вы прошли тест. Ваш результат: <span className="font-semibold text-red-600">{id}</span> из 5. </p>
                <button
                    onClick={handleBack}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg text-lg hover:bg-green-700 transition">
                    Вернуться на главную
                </button>
            </div>
        </div>
    );
};

export default Finish;