window.onload = function() {
    // Убираем загрузочный экран после загрузки страницы
    document.getElementById('loading').style.display = 'none';
    // Показываем контент с анимацией
    document.getElementById('content').style.opacity = '1';
};

// Инициализация контента с начальным состоянием (прозрачность)
document.getElementById('content').style.opacity = '0';

/* Открыть, когда кто-то нажимает на элемент span */
function openNav() {
    document.getElementsByClassName("nav").style.width = "100%";
  }
  
  /* Закрыть, когда кто-то нажимает на символ "x" внутри наложения */
  function closeNav() {
    document.getElementsByClassName("nav").style.display = "none";
  }