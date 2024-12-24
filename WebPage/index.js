const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
  
const app = express();
const PORT = 3000;

// Используем body-parser для обработки JSON
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'materials')));
app.use(express.static(path.join(__dirname, 'templates/home')));

// Объект для хранения кодов и времени их создания
const validCodes = {};

// Эндпоинт для получения кода от бота
app.post('/receive-code', (req, res) => {
    const { code, userId, timestamp } = req.body; // Получаем код, ID пользователя и время получения
    console.log(`Получен код: ${code} от пользователя: ${userId} в ${new Date(timestamp).toLocaleString()}`);

    // Проверяем, был ли уже отправлен код
    if (validCodes[userId]) {
        console.log(`Пользователь ${userId} уже получил код: ${validCodes[userId].code}`);
        return res.status(400).json({ message: `Пользователь ${userId} уже получил код: ${validCodes[userId].code}` });
    }

    // Сохраняем код и время его создания
    validCodes[userId] = { code, timestamp }; 
    res.sendStatus(200);
});

// Эндпоинт для проверки кода
app.post('/check-code', (req, res) => {
    const { userId, code } = req.body; // Получаем ID пользователя и введенный код
    console.log(`Проверка кода для пользователя: ${userId}`);

    // Проверяем, существует ли код и не истек ли он
    if (validCodes[userId]) {
        const { code: savedCode, timestamp } = validCodes[userId];
        const currentTime = Date.now();
        const oneWeekInMillis = 7 * 24 * 60 * 60 * 1000; // 1 неделя в миллисекундах

        if (currentTime - timestamp <= oneWeekInMillis) {
            // Сравниваем введенный код с сохраненным кодом
            if (code === savedCode) {
                console.log(`Код действителен для пользователя ${userId}: ${savedCode}`);
                return res.json({ code: savedCode }); // Возвращаем действительный код
            } else {
                console.log(`Введенный код недействителен для пользователя ${userId}.`);
                return res.status(403).json({ message: 'Введенный код недействителен.' });
            }
        } else {
            console.log(`Код истек для пользователя ${userId}.`);
            delete validCodes[userId]; // Удаляем истекший код
            return res.status(403).json({ message: 'Код истек.' });
        }
    } else {
        console.log(`Код не найден для пользователя ${userId}.`);
        return res.status(404).json({ message: 'Код не найден.' });
    }
});

// Обработчик для корневого маршрута
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'home', 'receive-code.html')); // Изменено на правильный путь
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});