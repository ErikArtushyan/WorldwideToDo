 // Функция для сдвига контейнера вправо
 function swape() {
    const container = document.getElementById('container');
    container.style.transform = 'translateX(100vw)'; // Сдвигаем элемент вправо за пределы экрана

    // Ждем завершения анимации перед переходом на другую страницу
    setTimeout(() => {
        window.location.href = '/index.html'; // Переход на loading.html
    }, 10000); // Время должно совпадать с длительностью анимации
}
// Получаем данные из localStorage
const responseData = localStorage.getItem('responseData');

if (document.referrer !== 'https://special-upward-shark.ngrok-free.app/receive-code.html') {
window.location = "https://special-upward-shark.ngrok-free.app/receive-code.html";
}

if (responseData) {
const data = JSON.parse(responseData); // Преобразуем строку обратно в объект

// Проверяем, есть ли сообщение об ошибке
if (data.message) {
console.error(data.message); // Отображаем сообщение об ошибке
} else {
console.log('Код действителен! Доступ разрешен.');
setTimeout(swape(), 5000); // Отображаем успешное сообщение
}

// Удаляем данные из localStorage, если они больше не нужны
localStorage.removeItem('responseData');
} else {
console.warn('Нет данных');
document.getElementById("warning").style.display = "flex";
document.getElementById("thanks").style.display = "none";
}

// Анимация при загрузке страницы
window.onload = function() {
    const container = document.getElementById('container');
    container.style.transform = 'translateX(0)'; // Сдвигаем элемент на место
};