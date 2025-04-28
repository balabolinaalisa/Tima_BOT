import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Test = () => {
    const { block } = useParams(); // Получаем номер блока из параметров URL
    const [questions, setQuestions] = useState([]); // Данные вопросов, начинаем с пустого массива
    const [answers, setAnswers] = useState([]); // Ответы пользователя
    const [submitted, setSubmitted] = useState(false); // Флаг отправки теста
    const navigate = useNavigate(); // Для навигации после отправки
    const [userId, setUserId] = useState(null); // ID пользователя из Telegram WebApp

    // Загружаем вопросы из API при монтировании компонента
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        const userId = tg?.initDataUnsafe?.user?.id;
        if (userId) {
            setUserId(userId);
        }

        // Получение вопросов с сервера для блока
        const fetchQuestions = async () => {
            try {
                const response = await fetch(`http://localhost:5057/api/tests/by-block/${block}`);
                if (!response.ok) {
                    throw new Error('Не удалось загрузить вопросы');
                }
                const data = await response.json();

                // Преобразуем данные вопросов, создаем массив вариантов ответов
                const formattedQuestions = data.map(q => ({
                    ...q,
                    options: [
                        q.variantA,
                        q.variantB,
                        q.variantC,
                        q.variantD || null // Если D пустое, добавляем пустую строку
                    ]
                }));
                console.log(formattedQuestions); 
                setQuestions(formattedQuestions);
                setAnswers(new Array(formattedQuestions.length).fill(null)); // Инициализация ответов
            } catch (error) {
                console.error("Ошибка загрузки тестов:", error);
            }
        };

        fetchQuestions();
    }, [block]);

    // Обработчик выбора ответа
    const handleSelect = (questionIndex, optionIndex) => {
        const newAnswers = [...answers];
        console.log(newAnswers);
        newAnswers[questionIndex] = optionIndex;
        setAnswers(newAnswers);
    };

    // Обработчик отправки теста
    const handleSubmit = async () => {
        const isAnyAnswerEmpty = answers.some((answer) => answer === null);
        if (isAnyAnswerEmpty) {
            alert("Ответьте на все вопросы!");
            return;
        }
        setSubmitted(true);
        const result = getResult();

        // Отправка на сервер
        if (userId) {
            try {
                await fetch("http://localhost:5057/api/progress", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userId,
                        testId: block, // Используем ID блока из URL
                        score: result,
                    }),
                });
            } catch (error) {
                console.error("Ошибка при отправке прогресса:", error);
            }
        }

        navigate(`/finish/${result}`,{ state: { totalQuestions: questions.length } });
    };

    // Функция для подсчета результата
    const getResult = () => {
        console.log(answers.filter((ans, index) => 
            ans === questions[index].answer))
        return answers.filter((ans, index) => 
            ans+1 === questions[index].answer).length;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-100 to-green-100 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">Тест блока {block}</h1>
      
            {questions.length === 0 ? (
              <p className="text-center text-gray-600">Загружаются вопросы...</p>
            ) : (
              questions.map((q, i) => (
                <div key={i} className="mb-6">
                  <p className="font-semibold mb-2">{i + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options
                      .filter(opt => opt !== null)
                      .map((opt, j) => (
                        <label key={j} className="flex items-center">
                          <input
                            type="radio"
                            name={`q-${i}`}
                            checked={answers[i] === j}
                            onChange={() => handleSelect(i, j)}
                            className="mr-3"
                          />
                          {opt}
                        </label>
                      ))}
                  </div>
                </div>
              ))
            )}
      
            {!submitted ? (
              <button
                onClick={handleSubmit}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition"
              >
                Отправить
              </button>
            ) : (
              <div className="mt-6 text-center text-lg font-semibold">
                Вы верно ответили на {getResult()} из {questions.length} вопросов.
              </div>
            )}
          </div>
        </div>
      );
    }      
export default Test;
