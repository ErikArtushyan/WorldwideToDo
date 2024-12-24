function swape() {
    const container = document.getElementById('container');
    container.style.transform = 'translateX(100vw)'; // Сдвигаем элемент вправо за пределы экрана

    // Ждем завершения анимации перед переходом на другую страницу
    setTimeout(() => {
        window.location.href = '/receive-code.html'; // Переход на loading.html
    }, 500); // Время должно совпадать с длительностью анимации
}