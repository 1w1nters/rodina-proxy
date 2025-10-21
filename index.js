const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Разрешаем CORS-запросы и обработку JSON
app.use(cors());
app.use(express.json());

// Единственный маршрут для приема репортов
app.post('/api/feedback', async (req, res) => {
    // 1. Получаем секретный URL вебхука из переменных окружения, настроенных на Render
    const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

    // 2. Проверка безопасности: если URL не настроен на сервере, отправляем ошибку
    if (!DISCORD_WEBHOOK_URL) {
        console.error("Критическая ошибка: Переменная DISCORD_WEBHOOK_URL не установлена на сервере!");
        return res.status(500).json({ success: false, message: 'Сервер не настроен для приема отчетов.' });
    }

    // 3. Извлекаем все данные, которые прислало расширение
    const { message, attachment, author, pageUrl, scriptVersion, server, vk } = req.body;

    // 4. Создаем красивое встраиваемое сообщение (embed) для Discord
    const embed = {
        color: 0x4299e1, // Фирменный синий цвет
        author: {
            name: `${author} | ${server}`, // Заголовок: "Ник | Сервер"
        },
        title: "Сообщение:",
        description: message,
        fields: [], // Массив для дополнительных полей
        footer: {
            text: `Rodina Helper v${scriptVersion} | ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`
        }
    };
    
    // Добавляем дополнительные поля в сообщение, только если они были переданы
    if (vk) {
        embed.fields.push({ name: "VK для связи", value: vk, inline: false });
    }
    if (attachment) {
        embed.fields.push({ name: "Вложение", value: attachment, inline: false });
    }
    if (pageUrl) {
        embed.fields.push({ name: "Страница отправки", value: pageUrl, inline: false });
    }

    // 5. Отправляем сформированное сообщение на настоящий URL вебхука
    try {
        await axios.post(DISCORD_WEBHOOK_URL, {
            username: "Rodina Helper Reports", // Имя, которое будет отображаться у бота в Discord
            // avatar_url: "URL_ВАШЕГО_ЛОГОТИПА", // Можете раскомментировать и вставить ссылку на иконку
            embeds: [embed]
        });
        res.status(200).json({ success: true, message: 'Отчет успешно отправлен.' });
    } catch (error) {
        console.error("Ошибка при отправке сообщения в Discord:", error.message);
        res.status(500).json({ success: false, message: 'Не удалось отправить сообщение в Discord.' });
    }
});

// Запускаем сервер
app.listen(PORT, () => {
    console.log(`Прокси-сервер Rodina Helper запущен на порту ${PORT}`);
});
