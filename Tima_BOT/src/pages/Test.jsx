import { Router, useParams, useNavigate } from "react-router-dom";
import {useState,useEffect} from "react";


const questions = [
{
    question:"Какой из следующих подходов наиболее эффективен для определения приоритетов задач?",
    options:["Метод ABCDE", "Метод 'Сделай это позже'", "Метод 'Случайного выбора'"],
    correct:0,
}, 
{
    question: "Какой из следующих инструментов лучше всего подходит для визуализации задач и их сроков?",
    options: ["Календарь", "Доска задач (Kanban)", "Тетрадь"],
    correct: 1,
  },
  {
    question: "Какой из следующих методов помогает в управлении проектами и задачами в команде?",
    options: ["Agile", "Метод 'Слепого выполнения'", "Метод 'Ожидания вдохновения'"],
    correct: 0,
  },
  {
    question: "Какой из следующих подходов может помочь в улучшении личной продуктивности?",
    options: [
      "Регулярные рефлексии и анализ выполненных задач",
      "Постоянное выполнение задач в порядке их поступления",
      "Игнорирование сроков выполнения задач",
    ],
    correct: 0,
  },
  {
    question: "Какой из следующих методов позволяет оценить, насколько эффективно вы используете свое время?",
    options: ["Ведение журнала времени", "Составление списка дел", "Оценка по интуиции"],
    correct: 0,
  },
];




const Test = ()=>{
    const {id}= useParams();
    const [answers, setAnswers]=useState(Array(questions.length).fill(null));
    const [submitted, setSubmitted]=useState(false);
    const navigate=useNavigate();
    const [userId, setUserId]=useState(null);


    useEffect(()=>{
      const tg=window.Telegram?.WebApp;
      const id=tg?.initDataUnsafe?.user?.id;
      if(id)
      {
        setUserId(id);
      }
    },[]);

    const handleSelect=(questionIndex,optionIndex)=>{
        const newAnswers=[...answers];
        newAnswers[questionIndex]=optionIndex;
        setAnswers(newAnswers);
    };

    const handleSubmit= async ()=>{
        const isAnyAnswerEmpty=answers.some((answer)=>answer===null);
        if(isAnyAnswerEmpty)
        {
          alert("Ответьте на все вопросы!");
          return;
        }
        setSubmitted(true);   
        const result=getResult();

      // Отправка на сервер временная, здесь исправить
      if (userId) {
        try {
          await fetch("https://your-backend.com/api/progress", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId,
              testId: 1, // или получи из useParams, если ID теста динамический
              score: result,
            }),
          });
        } catch (error) {
          console.error("Ошибка при отправке прогресса:", error);
        }
      }
        navigate(`/finish/${getResult()}`);
    };

    const getResult=()=>{
        return answers.filter((ans,index)=>ans===questions[index].correct).length;
    }

 

    return (
        <div className="max-w-2xl mx-auto p-4 bg-white rounded-xl shadow-xl">
            <h1 className="text-xl font-bold mb-4">Тест по управлению задачами</h1> 
            {questions.map((q,i)=>(
                <div key={i} className="mb-6">
                    <p className="font-semibold">{i+1}.{q.question}</p>
                    <div className="mt-2 space-y-1">
                        {q.options.map((opt,j)=>(
                            <label key={j} className="block">
                                <input
                                type="radio"
                                name={`q-${i}`}
                                checked={answers[i]===j}
                                onChange={()=>handleSelect(i,j)}
                                className="mr-2"
                                />
                                {opt}
                            </label>
                         ))}
                  </div> 
        </div>
            ))}
            {!submitted ? (
              <button
              onClick={handleSubmit}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition"
              >
                Отправить
              </button>
            ) : (
              <div className="mt-4 text-lg font-semibold">
                Вы верно
              </div>
            )}
        </div>    
    );
};

export default Test;