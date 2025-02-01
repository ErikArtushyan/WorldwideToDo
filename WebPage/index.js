const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const { encryptData, decryptData } = require('./materials/js/cryptoUtils');

const app = express();
const PORT = 3000;

// Настройка CORS
app.use(cors({
  origin: '*', // Разрешить все домены (для тестирования)
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true,
}));

// Настройка подключения к PostgreSQL
const pool = new Pool({
  user: 'ErikArt',
  host: 'localhost',
  database: 'appact',
  password: 'erik999_crazy',
  port: 5432,
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'materials')));
app.use(express.static(path.join(__dirname, 'templates/home')));

// Эндпоинт для создания задачи
app.post('/create-task', async (req, res) => {
  const { userId, taskName, startDate, endDate } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO tasks (userid, taskname, startdate, enddate) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, taskName, startDate, endDate]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при создании задачи:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Эндпоинт для получения задач пользователя
app.get('/tasks/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query('SELECT * FROM tasks WHERE userid = $1', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Задачи не найдены' });
    }

    const tasks = result.rows.map(task => ({
      id: task.taskid,
      userId: task.userid,
      taskName: task.taskname,
      startDate: task.startdate,
      endDate: task.enddate,
    }));

    res.json(tasks);
  } catch (error) {
    console.error('Ошибка при получении задач:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Эндпоинт для удаления задачи
app.delete('/delete-task/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM tasks WHERE taskid = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Ошибка при удалении задачи:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Эндпоинт для получения кода
app.post('/receive-code', async (req, res) => {
  const { code, userId, timestamp } = req.body;

  try {
    // Удаляем старые коды для этого пользователя
    await pool.query('DELETE FROM codes WHERE user_id = $1', [userId]);

    // Сохраняем новый код в базу данных
    await pool.query(
      'INSERT INTO codes (code, user_id, timestamp) VALUES ($1, $2, $3)',
      [code, userId, timestamp]
    );

    res.status(200).json({ message: 'Код успешно сохранен.' });
  } catch (error) {
    console.error('Ошибка при сохранении кода:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.post('/check-code', async (req, res) => {
  const { code, userId } = req.body;

  try {
    // Проверяем, существует ли код в базе данных
    const result = await pool.query(
      'SELECT * FROM codes WHERE code = $1 AND user_id = $2',
      [code, userId]
    );

    if (result.rows.length > 0) {
      const codeData = result.rows[0];
      const currentTime = Date.now();
      const codeTimestamp = parseInt(codeData.timestamp);

      // Проверяем, не истек ли срок действия кода (7 дней)
      if (currentTime - codeTimestamp <= 7 * 24 * 60 * 60 * 1000) {
        res.status(200).json({ message: 'Код действителен! Доступ разрешен.' });
      } else {
        // Удаляем просроченный код
        await pool.query('DELETE FROM codes WHERE code = $1', [code]);
        res.status(400).json({ message: 'Код недействителен. Срок действия истек.' });
      }
    } else {
      res.status(400).json({ message: 'Код недействителен. Доступ запрещен.' });
    }
  } catch (error) {
    console.error('Ошибка при проверке кода:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Эндпоинт для проверки существования пользователя
app.get('/check-user/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query('SELECT 1 FROM users WHERE userid = $1', [user_id]);

    if (result.rows.length > 0) {
      res.status(200).json({ exists: true });
    } else {
      res.status(404).json({ exists: false });
    }
  } catch (error) {
    console.error('Ошибка при проверке пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Регистрация пользователя
app.post('/register', async (req, res) => {
  const { user_id, username, firstname, lastname } = req.body;

  try {
    await pool.query(
      'INSERT INTO users (userid, username, firstname, lastname) VALUES ($1, $2, $3, $4) ON CONFLICT (userid) DO NOTHING',
      [user_id, username, firstname, lastname]
    );
    res.status(201).json({ message: 'Пользователь зарегистрирован' });
  } catch (err) {
    console.error('Ошибка при регистрации пользователя:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавление дохода
app.post('/add-income', async (req, res) => {
  const { userId, description, amount } = req.body;

  try {
    const encryptedDescription = encryptData(description);

    const result = await pool.query(
      'INSERT INTO incomes (user_id, description, amount) VALUES ($1, $2, $3) RETURNING *',
      [userId, encryptedDescription, amount]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при добавлении дохода:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение доходов пользователя
app.get('/incomes/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM incomes WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);

    if (result.rows.length === 0) {
      return res.status(200).json([]); // Возвращаем пустой массив, если данных нет
    }

    const incomes = result.rows.map(income => {
      const decryptedDescription = decryptData(income.description);

      if (!decryptedDescription) {
        console.error('Ошибка при расшифровке описания дохода:', income.description);
        return null;
      }

      return {
        id: income.id,
        user_id: income.user_id,
        description: decryptedDescription,
        amount: income.amount,
        createdAt: income.created_at,
      };
    }).filter(income => income !== null); // Убираем null-значения

    res.json(incomes);
  } catch (error) {
    console.error('Ошибка при получении доходов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавление расхода
app.post('/add-expense', async (req, res) => {
  const { userId, description, amount } = req.body;

  try {
    const encryptedDescription = encryptData(description);

    const result = await pool.query(
      'INSERT INTO expenses (user_id, description, amount) VALUES ($1, $2, $3) RETURNING *',
      [userId, encryptedDescription, amount]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при добавлении расхода:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение расходов пользователя
app.get('/expenses/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM expenses WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);

    if (result.rows.length === 0) {
      return res.status(200).json([]); // Возвращаем пустой массив, если данных нет
    }

    const expenses = result.rows.map(expense => {
      const decryptedDescription = decryptData(expense.description);

      if (!decryptedDescription) {
        console.error('Ошибка при расшифровке описания расхода:', expense.description);
        return null;
      }

      return {
        id: expense.id,
        user_id: expense.user_id,
        description: decryptedDescription,
        amount: expense.amount,
        createdAt: expense.created_at,
      };
    }).filter(expense => expense !== null); // Убираем null-значения

    res.json(expenses);
  } catch (error) {
    console.error('Ошибка при получении расходов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавление поста
app.post('/add-post', async (req, res) => {
  const { userid, title, description, imageUrl, linkUrl } = req.body;

  try {
    const encryptedTitle = encryptData(title);
    const encryptedDescription = encryptData(description);
    const encryptedImageUrl = encryptData(imageUrl || ''); // Если imageUrl пустой, шифруем пустую строку
    const encryptedLinkUrl = encryptData(linkUrl || '');   // Если linkUrl пустой, шифруем пустую строку

    const result = await pool.query(
      'INSERT INTO posts (user_id, title, description, image_url, link_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userid, encryptedTitle, encryptedDescription, encryptedImageUrl, encryptedLinkUrl]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при добавлении поста:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение постов пользователя
app.get('/posts/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);

    if (result.rows.length === 0) {
      return res.status(200).json([]); // Возвращаем пустой массив, если данных нет
    }

    const posts = result.rows.map(post => {
      const decryptedTitle = decryptData(post.title);
      const decryptedDescription = decryptData(post.description);
      const decryptedImageUrl = decryptData(post.image_url);
      const decryptedLinkUrl = decryptData(post.link_url);

      return {
        id: post.id,
        user_id: post.user_id,
        title: decryptedTitle,
        description: decryptedDescription,
        imageUrl: decryptedImageUrl,
        linkUrl: decryptedLinkUrl,
        createdAt: post.created_at,
      };
    });

    res.json(posts);
  } catch (error) {
    console.error('Ошибка при получении постов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удаление дохода
app.delete('/delete-income/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM incomes WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Ошибка при удалении дохода:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удаление расхода
app.delete('/delete-expense/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Ошибка при удалении расхода:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удаление поста
app.delete('/delete-post/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Ошибка при удалении поста:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обработчик для корневого маршрута
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'home', 'receive-code.html'));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});