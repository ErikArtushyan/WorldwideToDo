

const userId = Number(localStorage.getItem('userId')); // Получаем ID пользователя

if (document.referrer !== 'https://special-upward-shark.ngrok-free.app/index.html') {
  window.location = "https://special-upward-shark.ngrok-free.app/index.html";
}


// Функция для добавления задачи
document.getElementById('addTaskBtn').addEventListener('click', async function() {
  const taskInput = document.getElementById('taskInput');
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;
  const taskText = taskInput.value;

  if (taskText && startTime && endTime) {
    try {
      // Отправляем задачу на сервер
      const response = await fetch('http://localhost:3000/create-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid: userId, // Используем userid
          taskName: taskText,
          startDate: new Date(startTime).toISOString(),
          endDate: new Date(endTime).toISOString(),
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        alert('Задача успешно добавлена!');
        loadTasks(); // Перезагружаем список задач
      } else {
        console.error('Ошибка от сервера:', responseData);
        alert(`Ошибка: ${responseData.message || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Ошибка при отправке задачи на сервер:', error);
      alert('Ошибка при отправке задачи на сервер');
    }

    taskInput.value = ''; // Очистить поле ввода
    document.getElementById('startTime').value = ''; // Очистить время начала
    document.getElementById('endTime').value = ''; // Очистить время окончания
  } else {
    alert('Пожалуйста, заполните все поля!');
  }
});

// Функция для загрузки задач из базы данных
async function loadTasks() {
  try {
    const response = await fetch(`http://localhost:3000/tasks/${userId}`);
    if (!response.ok) {
      throw new Error('Ошибка при загрузке задач');
    }

    const tasks = await response.json();
    console.log('Ответ сервера:', tasks);

    const taskList = document.getElementById('taskList');
    taskList.innerHTML = ''; // Очищаем список задач

    if (tasks.length === 0) {
      taskList.innerHTML = '<li>Нет задач. Вы можете создать их.</li>';
      return;
    }

    tasks.forEach(task => {
      const li = document.createElement('li');

      // Проверяем, что данные существуют
      const taskName = task.taskName || 'Нет названия';
      const startDate = task.startDate ? new Date(task.startDate).toLocaleString() : 'Не указано';
      const endDate = task.endDate ? new Date(task.endDate).toLocaleString() : 'Не указано';

      // Отображаем задачу
      li.textContent = `${taskName} (Начало: ${startDate}, Конец: ${endDate})`;

      // Добавление кнопки удаления
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Удалить';
      deleteBtn.addEventListener('click', async function() {
        try {
          // Удаляем задачу из базы данных
          const response = await fetch(`http://localhost:3000/delete-task/${task.id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            li.remove(); // Удаляем задачу из списка
          } else {
            const errorData = await response.json();
            console.error('Ошибка при удалении задачи:', errorData);
            alert(`Ошибка: ${errorData.message || 'Неизвестная ошибка'}`);
          }
        } catch (error) {
          console.error('Ошибка при удалении задачи:', error);
          alert('Ошибка при удалении задачи');
        }
      });
      li.appendChild(deleteBtn);

      taskList.appendChild(li);
    });
  } catch (error) {
    console.error('Ошибка при загрузке задач:', error);
    alert('Ошибка при загрузке задач');
  }
}

document.querySelectorAll('.navbar a').forEach(link => {
  link.addEventListener('mouseover', () => {
    link.style.color = '#007BFF';
  });

  link.addEventListener('mouseout', () => {
    link.style.color = '#333';
  });
});

// Загружаем задачи при загрузке страницы
window.addEventListener('load', loadTasks);