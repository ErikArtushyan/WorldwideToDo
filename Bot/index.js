const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const crypto = require('crypto');

// Замените на ваш API-ключ бота
const API_KEY_BOT = '7615560891:AAG1VizTon5cqMwHm3yD6wvHhHTheVTt6LQ';
const CHANNEL_ID = '-1002023999957'; // Ваш ID канала

// Создаем экземпляр бота
const bot = new TelegramBot(API_KEY_BOT, {
  polling: {
    interval: 300,
    autoStart: true,
  },
});

// Обработка текстовых сообщений
bot.on('text', async (msg) => {
  try {
    const userIP = msg.from.id;

    // Команда /start
    if (msg.text.startsWith('/start')) {
      await bot.sendMessage(msg.chat.id, `Вы запустили бота!`, {});

      // Регистрируем пользователя в базе данных
      const { id, username, first_name, last_name } = msg.from;
      await axios.post('http://localhost:3000/register', {
        userId: id,
        username,
        firstName: first_name,
        lastName: last_name,
      });

      // Показываем меню
      await showMainMenu(msg.chat.id);
    }

    // Команда /menu
    else if (msg.text == '/menu') {
      await showMainMenu(msg.chat.id);
    }

    // Раздел "Задачи"
    else if (msg.text == '⭐️ Задачи') {
      await bot.sendMessage(msg.chat.id, `Вас приветствует раздел задач.`, {
        reply_markup: {
          keyboard: [
            ['📝 Создать задачу'],
            ['📋 Мои задачи'],
            ['❌ Закрыть меню'],
          ],
          resize_keyboard: true,
        },
      });
    }

    // Раздел "Доходы и расходы"
    else if (msg.text == '💰 Доходы и расходы') {
      await bot.sendMessage(msg.chat.id, `Вас приветствует раздел доходов и расходов.`, {
        reply_markup: {
          keyboard: [
            ['💵 Добавить доход'],
            ['💸 Добавить расход'],
            ['📊 Показать баланс'],
            ['❌ Закрыть меню'],
          ],
          resize_keyboard: true,
        },
      });
    }

    // Раздел "Дневник"
    else if (msg.text == '📔 Дневник') {
      await bot.sendMessage(msg.chat.id, `Вас приветствует раздел дневника.`, {
        reply_markup: {
          keyboard: [
            ['📝 Добавить пост'],
            ['📋 Мои посты'],
            ['❌ Закрыть меню'],
          ],
          resize_keyboard: true,
        },
      });
    }

    // Добавление дохода
    else if (msg.text == '💵 Добавить доход') {
      await bot.sendMessage(msg.chat.id, 'Введите описание дохода и сумму в формате:\n"Описание; Сумма"');

      // Ожидаем ввод данных от пользователя
      bot.once('message', async (msg) => {
        const [description, amount] = msg.text.split(';');

        if (description && amount) {
          try {
            // Отправляем данные на сервер
            const response = await axios.post('http://localhost:3000/add-income', {
              userId: msg.from.id, // Убедимся, что userId передается
              description: description.trim(),
              amount: parseFloat(amount.trim()),
            });

            if (response.status === 201) {
              bot.sendMessage(msg.chat.id, 'Доход успешно добавлен!');
            } else {
              bot.sendMessage(msg.chat.id, 'Ошибка при добавлении дохода.');
            }
          } catch (error) {
            console.error('Ошибка при добавлении дохода:', error);
            bot.sendMessage(msg.chat.id, 'Ошибка при добавлении дохода.');
          }
        } else {
          bot.sendMessage(msg.chat.id, 'Неверный формат. Попробуйте снова.');
        }
      });
    }

    // Добавление расхода
    else if (msg.text == '💸 Добавить расход') {
      await bot.sendMessage(msg.chat.id, 'Введите описание расхода и сумму в формате:\n"Описание; Сумма"');

      // Ожидаем ввод данных от пользователя
      bot.once('message', async (msg) => {
        const [description, amount] = msg.text.split(';');

        if (description && amount) {
          try {
            // Отправляем данные на сервер
            const response = await axios.post('http://localhost:3000/add-expense', {
              userId: msg.from.id, // Убедимся, что userId передается
              description: description.trim(),
              amount: parseFloat(amount.trim()),
            });

            if (response.status === 201) {
              bot.sendMessage(msg.chat.id, 'Расход успешно добавлен!');
            } else {
              bot.sendMessage(msg.chat.id, 'Ошибка при добавлении расхода.');
            }
          } catch (error) {
            console.error('Ошибка при добавлении расхода:', error);
            bot.sendMessage(msg.chat.id, 'Ошибка при добавлении расхода.');
          }
        } else {
          bot.sendMessage(msg.chat.id, 'Неверный формат. Попробуйте снова.');
        }
      });
    }

    // Показать баланс
    else if (msg.text == '📊 Показать баланс') {
      const userId = msg.from.id;

      try {
        // Получаем доходы и расходы пользователя из базы данных
        const incomesResponse = await axios.get(`http://localhost:3000/incomes/${userId}`);
        const expensesResponse = await axios.get(`http://localhost:3000/expenses/${userId}`);

        const incomes = incomesResponse.data;
        const expenses = expensesResponse.data;

        // Рассчитываем баланс
        let totalIncome = incomes.reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);
        let totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
        const balance = totalIncome - totalExpenses;

        // Формируем сообщение
        let message = `Ваш баланс: ${balance.toFixed(2)}\n\n`;
        message += `Доходы:\n`;
        incomes.forEach((income) => {
          message += `- ${income.description}: ${parseFloat(income.amount || 0).toFixed(2)}\n`;
        });
        message += `\nРасходы:\n`;
        expenses.forEach((expense) => {
          message += `- ${expense.description}: ${parseFloat(expense.amount || 0).toFixed(2)}\n`;
        });

        bot.sendMessage(msg.chat.id, message);
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
        bot.sendMessage(msg.chat.id, 'Ошибка при получении данных.');
      }
    }

    // Добавление поста в дневник
    else if (msg.text == '📝 Добавить пост') {
      await bot.sendMessage(msg.chat.id, 'Введите заголовок, описание, ссылку на изображение и ссылку в формате:\n"Заголовок; Описание; Ссылка на изображение; Ссылка"');

      // Ожидаем ввод данных от пользователя
      bot.once('message', async (msg) => {
        const [title, description, imageUrl, linkUrl] = msg.text.split(';');

        if (title && description) {
          try {
            // Отправляем данные на сервер
            const response = await axios.post('http://localhost:3000/add-post', {
              userId: msg.from.id,
              title: title.trim(),
              description: description.trim(),
              imageUrl: imageUrl ? imageUrl.trim() : null,
              linkUrl: linkUrl ? linkUrl.trim() : null,
            });

            if (response.status === 201) {
              bot.sendMessage(msg.chat.id, 'Пост успешно добавлен!');
            } else {
              bot.sendMessage(msg.chat.id, 'Ошибка при добавлении поста.');
            }
          } catch (error) {
            bot.sendMessage(msg.chat.id, 'Ошибка при добавлении поста.');
          }
        } else {
          bot.sendMessage(msg.chat.id, 'Неверный формат. Попробуйте снова.');
        }
      });
    }

    // Показать посты пользователя
    else if (msg.text == '📋 Мои посты') {
      const userId = msg.from.id;

      try {
        // Получаем посты пользователя из базы данных
        const response = await axios.get(`http://localhost:3000/posts/${userId}`);
        const posts = response.data;

        if (posts.length > 0) {
          let message = 'Ваши посты:\n\n';
          posts.forEach((post) => {
            message += `📌 ${post.title}\n`;
            message += `📝 ${post.description}\n`;
            if (post.image_url) {
              message += `🖼️ [Изображение](${post.image_url})\n`;
            }
            if (post.link_url) {
              message += `🔗 [Ссылка](${post.link_url})\n`;
            }
            message += '\n';
          });
          bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
        } else {
          bot.sendMessage(msg.chat.id, 'У вас пока нет постов. Вы можете создать их.');
        }
      } catch (error) {
        bot.sendMessage(msg.chat.id, 'Ошибка при получении постов.');
      }
    }

    // Обработка кнопки "📋 Мои задачи"
    else if (msg.text == '📋 Мои задачи') {
      const userId = msg.from.id;

      try {
        // Получаем задачи пользователя из базы данных
        const response = await axios.get(`http://localhost:3000/tasks/${userId}`);
        const tasks = response.data;

        if (tasks.length > 0) {
          let message = 'Ваши задачи:\n\n';
          tasks.forEach((task) => {
            message += `📌 ${task.taskName}\n`;
            message += `📅 Начало: ${new Date(task.startDate).toLocaleDateString()}\n`;
            message += `📅 Окончание: ${new Date(task.endDate).toLocaleDateString()}\n`;
            message += '\n';
          });
          bot.sendMessage(msg.chat.id, message);
        } else {
          bot.sendMessage(msg.chat.id, 'У вас пока нет задач. Вы можете создать их.');
        }
      } catch (error) {
        console.error('Ошибка при получении задач:', error);
        bot.sendMessage(msg.chat.id, 'Ошибка при получении задач.');
      }
    }

    // Проверка подписки на канал
    else if (msg.text === '/check_sub') {
      const chatMember = await bot.getChatMember(CHANNEL_ID, msg.from.id);
      if (chatMember.status === 'member' || chatMember.status === 'administrator' || chatMember.status === 'creator') {
        // Генерация 16-символьного кода
        const fixedCode = crypto.randomBytes(8).toString('hex'); // Генерация кода
        const timestamp = Date.now(); // Время получения кода

        // Отправка данных на сервер
        await axios.post('http://localhost:3000/receive-code', {
          code: fixedCode,
          userId: msg.from.id,
          timestamp,
        });

        await bot.sendMessage(msg.chat.id, `Вы подписаны на канал! Ваш код: ${fixedCode}`);
      } else {
        await bot.sendMessage(msg.chat.id, `Вы не подписаны на канал. Пожалуйста, подпишитесь и попробуйте снова.`);
      }
    }

    // Закрыть меню
    else if (msg.text == '❌ Закрыть меню') {
      await bot.sendMessage(msg.chat.id, 'Меню закрыто', {
        reply_markup: {
          remove_keyboard: true,
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// Функция для отображения главного меню
async function showMainMenu(chatId) {
  await bot.sendMessage(chatId, `Меню бота`, {
    reply_markup: {
      keyboard: [
        ['⭐️ Материалы'],
        ['⭐️ Задачи'],
        ['💰 Доходы и расходы'],
        ['📔 Дневник'],
        ['⭐️ Поддержка'],
        ['❌ Закрыть меню'],
      ],
      resize_keyboard: true,
    },
  });
}

// Определение команд
const commands = [
  {
    command: 'start',
    description: 'Запуск бота',
  },
  {
    command: 'check_sub',
    description: 'Проверить подписку на канал',
  },
  {
    command: 'help',
    description: 'Раздел помощи',
  },
  {
    command: 'menu',
    description: 'Меню бота',
  },
];

// Установка команд бота
bot.setMyCommands(commands);

bot.onText(/📝 Создать задачу/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    await bot.sendMessage(
        chatId,
        'Введите название задачи, дату начала и дату окончания в формате:\n"Название задачи; ГГГГ-ММ-ДД; ГГГГ-ММ-ДД"'
    );

    // Ожидаем ввод данных от пользователя
    bot.once('message', async (msg) => {
        const [taskName, startDate, endDate] = msg.text.split(';');

        if (taskName && startDate && endDate) {
            try {
                // Отправляем данные на сервер
                const response = await axios.post('http://localhost:3000/create-task', {
                    userId: userId, // Убедитесь, что userId передается
                    taskName: taskName.trim(),
                    startDate: new Date(startDate.trim()).toISOString(),
                    endDate: new Date(endDate.trim()).toISOString(),
                });

                if (response.status === 201) {
                    bot.sendMessage(chatId, 'Задача успешно создана!');
                } else {
                    bot.sendMessage(chatId, 'Ошибка при создании задачи.');
                }
            } catch (error) {
                console.error('Ошибка при создании задачи:', error);
                bot.sendMessage(chatId, 'Ошибка при создании задачи.');
            }
        } else {
            bot.sendMessage(chatId, 'Неверный формат задачи. Попробуйте снова.');
        }
    });
});