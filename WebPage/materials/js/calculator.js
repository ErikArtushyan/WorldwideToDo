let totalIncome = 0;
let totalExpenses = 0;
const userId = Number(localStorage.getItem('userId')); // Получаем ID пользователя




if (document.referrer !== 'https://special-upward-shark.ngrok-free.app/receive-code.html') {
    window.location = "https://special-upward-shark.ngrok-free.app/receive-code.html";
  }

  if (document.referrer !== 'https://special-upward-shark.ngrok-free.app/index.html') {
    window.location = "https://special-upward-shark.ngrok-free.app/index.html";
  }

  if (document.referrer !== 'https://special-upward-shark.ngrok-free.app/diary.html') {
    window.location = "https://special-upward-shark.ngrok-free.app/diary.html";
}

if (document.referrer !== 'https://special-upward-shark.ngrok-free.app/motivs.html') {
    window.location = "https://special-upward-shark.ngrok-free.app/motivs.html";
  }


// Функция для отправки дохода на сервер
async function addIncome() {
    const description = document.getElementById('income-description').value;
    const amount = parseFloat(document.getElementById('income-amount').value);

    if (description && !isNaN(amount)) {
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
                        user_id: userId, // Используем user_id
                        username: 'default_username',
                        firstname: 'default_firstName',
                        lastname: 'default_lastName',
                    }),
                });
            }

            // Отправляем данные на сервер
            const response = await fetch('http://localhost:3000/add-income', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId, description, amount }), // Используем user_id
            });

            if (response.ok) {
                await loadIncomes(); // Перезагружаем список доходов
                updateBalance();
                clearInputs('income-description', 'income-amount');
            } else {
                console.error('Ошибка от сервера:', await response.json());
            }
        } catch (error) {
            console.error('Ошибка при отправке дохода:', error);
        }
    } else {
        alert('Пожалуйста, заполните все поля корректно!');
    }
}

// Функция для отправки расхода на сервер
async function addExpense() {
    const description = document.getElementById('expense-description').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);

    if (description && !isNaN(amount)) {
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
                        user_id: userId, // Используем user_id
                        username: 'default_username',
                        firstname: 'default_firstName',
                        lastname: 'default_lastName',
                    }),
                });
            }

            // Отправляем данные на сервер
            const response = await fetch('http://localhost:3000/add-expense', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId, description, amount }), // Используем user_id
            });

            if (response.ok) {
                await loadExpenses(); // Перезагружаем список расходов
                updateBalance();
                clearInputs('expense-description', 'expense-amount');
            } else {
                console.error('Ошибка от сервера:', await response.json());
            }
        } catch (error) {
            console.error('Ошибка при отправке расхода:', error);
        }
    } else {
        alert('Пожалуйста, заполните все поля корректно!');
    }
}

// Функция для загрузки доходов с сервера
async function loadIncomes() {
    try {
        const response = await fetch(`http://localhost:3000/incomes/${userId}`);
        if (!response.ok) {
            throw new Error('Ошибка при загрузке доходов');
        }

        const incomes = await response.json();

        if (!Array.isArray(incomes)) {
            throw new Error('Данные доходов не являются массивом');
        }

        const incomeList = document.getElementById('income-list');
        incomeList.innerHTML = ''; // Очищаем список

        totalIncome = 0;
        incomes.forEach(income => {
            totalIncome += parseFloat(income.amount); // Убедимся, что amount является числом
            addToList('income-list', income.description, income.amount, 'income', income.id);
        });
        updateBalance();
    } catch (error) {
        console.error('Ошибка при загрузке доходов:', error);
    }
}

// Функция для загрузки расходов с сервера
async function loadExpenses() {
    try {
        const response = await fetch(`http://localhost:3000/expenses/${userId}`);
        if (!response.ok) {
            throw new Error('Ошибка при загрузке расходов');
        }

        const expenses = await response.json();

        if (!Array.isArray(expenses)) {
            throw new Error('Данные расходов не являются массивом');
        }

        const expenseList = document.getElementById('expense-list');
        expenseList.innerHTML = ''; // Очищаем список

        totalExpenses = 0;
        expenses.forEach(expense => {
            totalExpenses += parseFloat(expense.amount); // Убедимся, что amount является числом
            addToList('expense-list', expense.description, expense.amount, 'expense', expense.id);
        });
        updateBalance();
    } catch (error) {
        console.error('Ошибка при загрузке расходов:', error);
    }
}

// Функция для обновления баланса
function updateBalance() {
    const balance = totalIncome - totalExpenses;
    document.getElementById('balance').innerText = balance.toFixed(2); // Округляем до 2 знаков после запятой
}

// Функция для добавления элемента в список
function addToList(listId, description, amount, type, id) {
    const list = document.getElementById(listId);
    const item = document.createElement('div');
    item.className = 'item';
    item.innerText = `${description}: ${amount}`;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.innerText = 'Удалить';
    deleteButton.onclick = async function () {
        await deleteItem(type, id);
    };

    item.appendChild(deleteButton);
    list.appendChild(item);
}

// Функция для удаления элемента
async function deleteItem(type, id) {
    try {
        const endpoint = type === 'income' ? `/delete-income/${id}` : `/delete-expense/${id}`;
        const response = await fetch(`http://localhost:3000${endpoint}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            if (type === 'income') {
                await loadIncomes();
            } else {
                await loadExpenses();
            }
        } else {
            console.error('Ошибка при удалении:', await response.json());
        }
    } catch (error) {
        console.error('Ошибка при удалении:', error);
    }
}

// Очистка полей ввода
function clearInputs(descriptionId, amountId) {
    document.getElementById(descriptionId).value = '';
    document.getElementById(amountId).value = '';
}

document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('mouseover', () => {
      link.style.color = '#007BFF';
    });
  
    link.addEventListener('mouseout', () => {
      link.style.color = '#333';
    });
  });
  

// Загрузка данных при загрузке страницы
window.addEventListener('load', () => {
    loadIncomes();
    loadExpenses();
});