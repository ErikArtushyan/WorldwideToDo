const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
// const API_KEY_BOT = 'Domain в боте botfather, для получения ключа api вашего бота';
// const CHANNEL_ID = '-1002023999957'; // Ваш ID канала
const crypto = require('crypto');
// const YOUR_CHAT_ID = 'Ваш чат ID';
let acceptingMaterials = false; // Переменная для отслеживания состояния
let messageHandler;


// Создаем экземпляр бота
const bot = new TelegramBot(API_KEY_BOT, {
    polling: {
        interval: 300,
        autoStart: true
    }
});

// Объект для хранения кодов по IP
const codesByIP = {};

// Обработка текстовых сообщений
bot.on('text', async msg => {
    try {
        const userIP = msg.from.id; 

            if (msg.text.startsWith('/start')) {
                await bot.sendMessage(msg.chat.id, `Вы запустили бота!`, {
                    
                });
                //Часть кнопок и их обработка
            } else if(msg.text == '/menu') {

                await bot.sendMessage(msg.chat.id, `Меню бота`, {
            
                    reply_markup: {
            
                        keyboard: [
            
                            ['⭐️ Материалы'],
                            ['⭐️ Поддержка'],
                            ['❌ Закрыть меню']
                        ],
                        resize_keyboard: true
            
                    }
            
                })
                //Сами кнопки(обработчики)
            
            } else if(msg.text == '⭐️ Материалы') {

                await bot.sendMessage(msg.chat.id, `Вас приветствует раздел материалы, здесь вы можете изучать материалы для саморазвития, программирования. Также вы здесь я музыка, которую я слушаю, и материалы от подписчиков, которые я выкладываю здесь, разного рода видео, картинки, книги. `, {
            
                    reply_markup: {
            
                        keyboard: [

                            ['⭐️ Музыка', '⭐️ Видео'],
                            ['⭐️ Книги', '⭐️ Боты'],
                            ['⭐️ Ссылки'],
                            ['❌ Закрыть меню']
            
                        ],
                        resize_keyboard: true
            
                    }
            
                })
            
            
            } else if (msg.text == '⭐️ Музыка') {
                await bot.sendMessage(msg.chat.id, 'В этом разделе вы можете делиться музыкой, которую вы слушаете. Нажмите "Предложить материалы", чтобы отправить свою музыку.', {
                    reply_markup: {
                        keyboard: [
                            ['Предложить материалы'],
                            ['❌ Закрыть меню']
                        ],
                        resize_keyboard: true
                    }
                });
            } else if (msg.text == '⭐️ Видео') {
                await bot.sendMessage(msg.chat.id, 'В этом разделе вы можете делиться видео, которые вам нравятся. Нажмите "Предложить материалы", чтобы отправить свое видео.', {
                    reply_markup: {
                        keyboard: [
                            ['Предложить материалы'],
                            ['❌ Закрыть меню']
                        ],
                        resize_keyboard: true
                    }
                });
            } else if (msg.text == '⭐️ Книги') {
                await bot.sendMessage(msg.chat.id, 'В этом разделе вы можете делиться книгами, которые вы читаете. Нажмите "Предложить материалы", чтобы отправить свою книгу.', {
                    reply_markup: {
                        keyboard: [
                            ['Предложить материалы'],
                            ['❌ Закрыть меню']
                        ],
                        resize_keyboard: true
                    }
                });
            } else if (msg.text == '⭐️ Боты') {
                await bot.sendMessage(msg.chat.id, 'В этом разделе вы можете делиться ботами, которые вам нравятся. Нажмите "Предложить материалы", чтобы отправить информацию о своем боте.', {
                    reply_markup: {
                        keyboard: [
                            ['Предложить материалы'],
                            ['❌ Закрыть меню']
                        ],
                        resize_keyboard: true
                    }
                });
            } 
            
            else if(msg.text == '❌ Закрыть меню') {

                await bot.sendMessage(msg.chat.id, 'Меню закрыто', {
            
                    reply_markup: {
            
                        remove_keyboard: true
            
                    }
            
                })
            
            } 
            ////////////////////////////////////////////////////////////////////
            
                if (msg.text === 'Предложить материалы') {
                    if (messageHandler) {
                        bot.removeListener('message', messageHandler);
                    }
                    acceptingMaterials = true; // Включаем режим приема материалов
                    await bot.sendMessage(msg.chat.id, 'Пожалуйста, отправьте свои материалы (файлы, ссылки, текст, голосовые или видеосообщения), и они будут отправлены мне в личные сообщения.');
                    bot.on('message', async (msg) => {
                        await handleIncomingMessage(msg);
                    });
                }
            
            
            // Функция для обработки входящих сообщений
            async function handleIncomingMessage(msg) {
                const chatId = 5852496192; // Ваш chat ID
                const userName = msg.from.username ? `@${msg.from.username}` : msg.from.first_name; // Форматируем имя пользователя

                let messageText = `Пользователь ${userName} предложил материал: `;
            
                if (msg.document) {
                    messageText += `${msg.document.file_name}`;
                    await bot.sendDocument(chatId, msg.document.file_id, { caption: messageText });
                } else if (msg.voice) {
                    messageText += `Голосовое сообщение`;
                    await bot.sendVoice(chatId, msg.voice.file_id, { caption: messageText });
                } else if (msg.text) {
                    messageText += `Текстовое сообщение: ${msg.text}`;
                    await bot.sendMessage(chatId, messageText);
                } else if (msg.photo) {
                    // Получаем ID самого высокого разрешения
                    const highestQualityPhoto = msg.photo[msg.photo.length - 1]; // Последний элемент - самое высокое разрешение
                    const photoId = highestQualityPhoto.file_id; // Получаем file_id
                    messageText += `Фото`;
                    await bot.sendPhoto(chatId, photoId, { caption: messageText });
                } else if (msg.video) {
                    messageText += `Видеосообщение`;
                    await bot.sendVideo(chatId, msg.video.file_id, { caption: messageText });
                } else if (msg.video_note) {
                    messageText += `Видеосообщение (кружок)`;
                    await bot.sendVideo(chatId, msg.video_note.file_id, { caption: messageText });
                }
            
                // Сообщение о завершении приема материалов
                await bot.sendMessage(msg.chat.id, 'Если вы закончили предлагать материалы, воспользуйтесь командой /stop_accepting, чтобы прекратить отправку сообщений.');
            }
            
            // Обработчик для завершения приема материалов
            if(msg.text  == '/stop_accepting') {
                if (messageHandler) {
                    bot.removeListener('message', messageHandler);
                    messageHandler = null;
                } else {
                    bot.removeListener('message', messageHandler);
                    messageHandler = null; 
                }
                acceptingMaterials = false; // Отключаем режим приема материалов
                setTimeout(() => 
                    bot.sendMessage(msg.chat.id, 'Прием материалов завершен. Чтобы снова отправить материалы, нажмите "Предложить материалы".'), 
                1000);
            }
            
            ////////////////////////////////////////////////////////////////////
// Проверка подписки кнопкой /check_sub
if (msg.text === '/check_sub') {
    const chatMember = await bot.getChatMember(CHANNEL_ID, msg.from.id);
    if (chatMember.status === 'member' || chatMember.status === 'administrator' || chatMember.status === 'creator') {
        // Проверяем, получал ли пользователь код ранее
        if (codesByIP[userIP] && (Date.now() - codesByIP[userIP].timestamp < 7 * 24 * 60 * 60 * 1000)) {
            await bot.sendMessage(msg.chat.id, `Вы уже получили код: ${codesByIP[userIP].code}`, {
                
            });
        } else {
            // Генерация 16-символьного кода
            const fixedCode = crypto.randomBytes(8).toString('hex'); // Генерация кода
            const timestamp = Date.now(); // Время получения кода
            codesByIP[userIP] = { code: fixedCode, timestamp }; // Сохраняем код и время получения
            await bot.sendMessage(msg.chat.id, `Вы подписаны на канал! Ваш код: ${fixedCode}`, {
                
            });

            // Отправка данных на локальный сервер
            await sendCodeToServer(fixedCode, msg.from.id, timestamp); // Передаем код, ID пользователя и время получения
        }
    } else {
        await bot.sendMessage(msg.chat.id, `Вы не подписаны на канал. Пожалуйста, подпишитесь и попробуйте снова.`, {
        });
    }
  }

    } catch (error) {
        console.log(error);
    }
    
    // Функция для отправки кода на сервер
    async function sendCodeToServer(code, userId, timestamp) {
        try {
            const response = await axios.post('http://localhost:3000/receive-code', { code, userId, timestamp });
            console.log('Ответ от сервера:', response.data);
        } catch (error) {
            console.error('Ошибка при отправке кода на сервер:', error);
        }
    }
})
// Определение команд
const commands = [
    {
        command: "start",
        description: "Запуск бота"
    },
    {
        command: "check_sub",
        description: "Проверить подписку на канал"
    },
    {
        command: "help",
        description: "Раздел помощи"
    },
    {
        command: "/menu",
        description: "Меню бота"
    },
];

// Установка команд бота
bot.setMyCommands(commands);