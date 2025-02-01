// Проверка реферера


if (document.referrer !== 'https://special-upward-shark.ngrok-free.app/receive-code.html') {
    window.location = "https://special-upward-shark.ngrok-free.app/receive-code.html";
  }

  if (document.referrer !== 'https://special-upward-shark.ngrok-free.app/index.html') {
    window.location = "https://special-upward-shark.ngrok-free.app/index.html";
  }
  
  if (document.referrer !== 'https://special-upward-shark.ngrok-free.app/calculator.html') {
    window.location = "https://special-upward-shark.ngrok-free.app/calculator.html";
  }
  
  if (document.referrer !== 'https://special-upward-shark.ngrok-free.app/motivs.html') {
    window.location = "https://special-upward-shark.ngrok-free.app/motivs.html";
  }
  

const userId = Number(localStorage.getItem('userId')); // Получаем ID пользователя

// Функция для добавления поста
async function addPost() {
    const title = document.getElementById('post-title').value;
    const description = document.getElementById('post-description').value;
    const imageUrl = document.getElementById('post-image').value;
    const linkUrl = document.getElementById('post-link').value;

    if (title && description) {
        try {
            // Проверяем, существует ли пользователь
            const userExistsResponse = await fetch(`http://localhost:3000/check-user/${userId}`);
            const userExistsData = await userExistsResponse.json();

            if (!userExistsData.exists) {
                // Если пользователь не существует, регистрируем его
                await fetch('http://localhost:3000/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userid: userId, // Используем userid
                        username: 'default_username',
                        firstname: 'default_firstName',
                        lastname: 'default_lastName',
                    }),
                });
            }

            // Отправляем данные на сервер
            const response = await fetch('http://localhost:3000/add-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userid: userId, // Используем userid
                    title,
                    description,
                    imageUrl: imageUrl || null, // Если imageUrl пустой, отправляем null
                    linkUrl: linkUrl || null,   // Если linkUrl пустой, отправляем null
                }),
            });

            if (response.ok) {
                await loadPosts(); // Перезагружаем список постов
                clearInputs();
            } else {
                const errorData = await response.json();
                console.error('Ошибка от сервера:', errorData);
                alert(`Ошибка: ${errorData.message || 'Неизвестная ошибка'}`);
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка при отправке данных на сервер');
        }
    } else {
        alert('Пожалуйста, заполните заголовок и описание!');
    }
}

// Функция для загрузки постов с сервера
async function loadPosts() {
    try {
        const response = await fetch(`http://localhost:3000/posts/${userId}`);
        if (!response.ok) {
            throw new Error(`Ошибка при загрузке постов: ${response.statusText}`);
        }

        const posts = await response.json();

        if (!Array.isArray(posts)) {
            throw new Error('Данные постов не являются массивом');
        }

        const postContainer = document.getElementById('posts-container');
        postContainer.innerHTML = ''; // Очищаем список

        if (posts.length === 0) {
            postContainer.innerHTML = '<p>Нет постов. Вы можете создать их.</p>';
            return;
        }

        posts.forEach((post) => {
            const postElement = document.createElement('div');
            postElement.className = 'post';

            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.description}</p>
                ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Пост картинка" />` : ''}
                ${post.linkUrl ? `<a href="${post.linkUrl}" target="_blank">Ссылка</a>` : ''}
                <button class="delete-button" onclick="deletePost(${post.id})">Удалить</button>
            `;

            postContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Ошибка при загрузке постов:', error);
        alert('Ошибка при загрузке постов');
    }
}

// Функция для удаления поста
async function deletePost(postId) {
    try {
        const response = await fetch(`http://localhost:3000/delete-post/${postId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            await loadPosts(); // Перезагружаем список постов
        } else {
            const errorData = await response.json();
            console.error('Ошибка при удалении поста:', errorData);
            alert(`Ошибка: ${errorData.message || 'Неизвестная ошибка'}`);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при удалении поста');
    }
}

// Очистка полей ввода
function clearInputs() {
    document.getElementById('post-title').value = '';
    document.getElementById('post-description').value = '';
    document.getElementById('post-image').value = '';
    document.getElementById('post-link').value = '';
}

document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('mouseover', () => {
      link.style.color = '#007BFF';
    });
  
    link.addEventListener('mouseout', () => {
      link.style.color = '#333';
    });
  });
  

// Загрузка постов при загрузке страницы
window.addEventListener('load', () => {
    loadPosts();
});