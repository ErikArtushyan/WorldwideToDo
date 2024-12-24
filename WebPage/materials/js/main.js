if (document.referrer !== 'https://special-upward-shark.ngrok-free.app/loading.html') {
    window.location = "https://special-upward-shark.ngrok-free.app/loading.html";
  }
document.getElementById('addTaskBtn').addEventListener('click', function() {
    const taskInput = document.getElementById('taskInput');
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const statusCounts = {
        notStart: 0,
        falseEnd: 0,
        falseStart: 0,
        end: 0
    };
    const taskText = taskInput.value;

    if (taskText) {
        const li = document.createElement('li');
        li.textContent = `${taskText} (Начало: ${startTime.replace('T', ' ')}, Конец: ${endTime.replace('T', ' ')})`;

        // Добавление цветной точки
        const statusDot = document.createElement('span');
        statusDot.classList.add('status-dot', 'not-started'); // По умолчанию статус "Не начато"
        li.prepend(statusDot);

        // Добавление возможности выбора статуса
        const statusSelect = document.createElement('select');
        statusSelect.innerHTML = `
            <option value="not-started" selected>Не начато</option>
            <option value="in-progress">В процессе</option>
            <option value="completed">Завершено</option>
        `;
        
        statusSelect.addEventListener('change', function() {
            const currentDate = new Date();
            const startDate = new Date(startTime);
            const timeDifference = startDate - currentDate;
            

            // Проверка на статус "В процессе"
            if (statusSelect.value === 'in-progress' && timeDifference > 7 * 24 * 60 * 60 * 1000 && statusCounts.notStart < 1) {
                showModal('До даты начала еще далеко. Вы уверены, что хотите выбрать статус "В процессе"?', function() {
                    statusDot.className = 'status-dot in-progress'; // Установить статус "В процессе"
                    statusCounts.notStart += 1;
                });
            } 
            // Проверка на статус "Завершено"
            else if (statusSelect.value === 'completed' && statusDot.classList.contains('not-started') && statusCounts.falseEnd < 1) {
                showModal('Вы еще не приступали к задаче. Вы уверены, что выполнили его?', function() {
                    statusDot.className = 'status-dot completed'; // Установить статус "Завершено"
                    statusCounts.falseEnd += 1;
                });
            }
            // Проверка на статус "Завершено и В процессе"
            else if (statusSelect.value === 'completed' && statusDot.classList.contains('in-progress') && statusCounts.falseStart < 1) {
                showModal('Вы уже завершали задачу. Вы уверены, что хотите выбрать статус "В процессе"?', function() {
                    statusDot.className = 'status-dot in-progress'; // Установить статус "В процессе"
                    statusCounts.falseStart += 1;
                });
            }  
            // Проверка на переключение из "Завершено" в "В процессе"
            else if (statusSelect.value === 'not-started' && statusDot.classList.contains('completed') && statusCounts.end < 1) {
                showModal('Вы уже завершали задачу. Вы уверены, что хотите выбрать статус "Не начато"?', function() {
                    statusDot.className = 'status-dot not-started'; // Установить статус "Не начато"
                    statusCounts.end += 1;
                });
            } else {
                // Обновление цвета точки в зависимости от статуса
                statusDot.className = 'status-dot'; // Сброс классов
                statusDot.classList.add(statusSelect.value);
            }
        });

        li.appendChild(statusSelect);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Удалить';
        deleteBtn.addEventListener('click', function() {
            li.remove();
        });

        li.appendChild(deleteBtn);
        document.getElementById('taskList').appendChild(li);
        taskInput.value = ''; // Очистить поле ввода
        document.getElementById('startTime').value = ''; // Очистить время начала
        document.getElementById('endTime').value = ''; // Очистить время окончания
    } else {
        alert('Пожалуйста, введите задачу!');
    }
});

// Функция для отображения модального окна
function showModal(message, onConfirm) {
    const modal = document.getElementById('modal');
    const modalMessage = document.getElementById('modalMessage');
    const confirmBtn = document.getElementById('confirmBtn');

    modalMessage.textContent = message;
    modal.style.display = 'block';

    confirmBtn.onclick = function() {
        modal.style.display = 'none';
        if (onConfirm) onConfirm(); // Выполнить функцию подтверждения
    };
}


// Закрытие модального окна
document.getElementById('closeModal').onclick = function() {
    document.getElementById('modal').style.display = 'none';
};

let navClicks = 0;
const mobNav = document.getElementsByClassName("mob-nav-holder");
const navBtn = document.getElementById("navbtn");

function anyFunction() {
    if(navClicks < 1) {
        
    if (mobNav.length > 0) { // Проверяем, что хотя бы один элемент найден
        mobNav[0].style.transform = "translate(-100px, 0px)";
        mobNav[0].style.opacity = "1"; // Обращаемся к первому элементу
        navBtn.style.transform = "translate(200px, 0px)"
        navClicks += 1;
    } else {
        console.error("Элемент с классом 'mob-nav-holder' не найден");
    }
    } else {
        mobNav[0].style.transform = "translate(-300px, 0px)";
        mobNav[0].style.opacity = "0";
        navBtn.style.transform = "translate(0px, 0px)"
        navClicks = 0;
    }
    
}