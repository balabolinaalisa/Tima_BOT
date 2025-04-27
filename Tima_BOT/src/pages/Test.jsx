import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Test = () => {
    const { block } = useParams(); // Получаем номер блока из параметров URL
    const [questions, setQuestions] = useState([]); // Данные вопросов
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
                setQuestions(data);
                setAnswers(new Array(data.length).fill(null)); // Инициализация ответов
            } catch (error) {
                console.error("Ошибка загрузки тестов:", error);
            }
        };

        fetchQuestions();
    }, [block]);

    // Обработчик выбора ответа
    const handleSelect = (questionIndex, optionIndex) => {
        const newAnswers = [...answers];
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

        navigate(`/finish/${result}`);
    };

    // Функция для подсчета результата
    const getResult = () => {
        return answers.filter((ans, index) => ans === questions[index].correct).length;
    };

    return (
        <div className="max-w-2xl mx-auto p-4 bg-white rounded-xl shadow-xl">
            <h1 className="text-xl font-bold mb-4">Тест блока {block}</h1>
            {questions.length === 0 ? (
                <p>Загружаются вопросы...</p>
            ) : (
                questions.map((q, i) => (
                    <div key={i} className="mb-6">
                        <p className="font-semibold">{i + 1}. {q.question}</p>
                        <div className="mt-2 space-y-1">
                            {q.options.map((opt, j) => (
                                <label key={j} className="block">
                                    <input
                                        type="radio"
                                        name={`q-${i}`}
                                        checked={answers[i] === j}
                                        onChange={() => handleSelect(i, j)}
                                        className="mr-2"
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
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition"
                >
                    Отправить
                </button>
            ) : (
                <div className="mt-4 text-lg font-semibold">
                    Вы верно ответили на {getResult()} из {questions.length} вопросов.
                </div>
            )}
        </div>
    );
};

export default Test;
