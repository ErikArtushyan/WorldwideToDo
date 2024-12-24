if (document.referrer !== 'https://special-upward-shark.ngrok-free.app/index.html') {
    window.location = "https://special-upward-shark.ngrok-free.app/index.html";
  }
let totalIncome = 0;
    let totalExpenses = 0;

    function addIncome() {
        const description = document.getElementById('income-description').value;
        const amount = parseFloat(document.getElementById('income-amount').value);

        if (description && !isNaN(amount)) {
            totalIncome += amount;
            updateBalance();
            addToList('income-list', description, amount, 'income');
            clearInputs('income-description', 'income-amount');
        }
    }

    function addExpense() {
        const description = document.getElementById('expense-description').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);

        if (description && !isNaN(amount)) {
            totalExpenses += amount;
            updateBalance();
            addToList('expense-list', description, amount, 'expense');
            clearInputs('expense-description', 'expense-amount');
        }
    }

    function updateBalance() {
        const balance = totalIncome - totalExpenses;
        document.getElementById('balance').innerText = balance;
    }

    function addToList(listId, description, amount, type) {
        const list = document.getElementById(listId);
        const item = document.createElement('div');
        item.className = 'item';
        item.innerText = `${description}: ${amount}`;

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.innerText = 'Удалить';
        deleteButton.onclick = function() {
            removeItem(item, amount, type);
        };

        item.appendChild(deleteButton);
        list.appendChild(item);
    }

    function removeItem(item, amount, type) {
        if (type === 'income') {
            totalIncome -= amount;
        } else if (type === 'expense') {
            totalExpenses -= amount;
        }
        updateBalance();
        item.remove();
    }

    function clearInputs(descriptionId, amountId) {
        document.getElementById(descriptionId).value = '';
        document.getElementById(amountId).value = '';
    }