if (document.referrer !== 'https://special-upward-shark.ngrok-free.app/index.html') {
    window.location = "https://special-upward-shark.ngrok-free.app/index.html";
  }
function addPost() {
    const title = document.getElementById('post-title').value;
    const description = document.getElementById('post-description').value;
    const imageUrl = document.getElementById('post-image').value;
    const linkUrl = document.getElementById('post-link').value;

    if (title && description) {
        const postContainer = document.getElementById('posts-container');
        const post = document.createElement('div');
        post.className = 'post';

        post.innerHTML = `
            <h3>${title}</h3>
            <p>${description}</p>
            ${imageUrl ? `<img src="${imageUrl}" alt="Пост картинка" />` : ''}
            ${linkUrl ? `<a href="${linkUrl}" target="_blank">Ссылка</a>` : ''}
            <button class="delete-button" onclick="deletePost(this)">Удалить</button>
        `;

        postContainer.appendChild(post);
        clearInputs();
    }
}

function deletePost(button) {
    const post = button.parentElement; // Получаем родительский элемент (пост)
    post.remove(); // Удаляем пост
}

function clearInputs() {
    document.getElementById('post-title').value = '';
    document.getElementById('post-description').value = '';
    document.getElementById('post-image').value = '';
    document.getElementById('post-link').value = '';
}