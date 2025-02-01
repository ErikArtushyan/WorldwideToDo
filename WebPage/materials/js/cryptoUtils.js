const CryptoJS = require('crypto-js');

// Секретный ключ (должен быть одинаковым на клиенте и сервере)
const SECRET_KEY = 'ваш_секретный_ключ';

// Функция для шифрования данных
function encryptData(data) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
}

// Функция для расшифровки данных
function decryptData(encryptedData) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

module.exports = { encryptData, decryptData };