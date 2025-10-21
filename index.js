// index.js (для вашего GitHub репозитория)
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/feedback', async (req, res) => {
    // 1. Получаем секретный URL вебхука из переменных окружения Render
    const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

    // 2. Проверка безопасности на сервере
    if (!DISCORD_WEBHOOK_URL) {
        console.error("Критическая ошибка: URL вебхука не настроен на сервере!");
        return res.status(500).json({ success: false, message: 'Сервер не настроен для приема отчетов.' });
    }

    // 3. Получаем данные, которые отправило расширение
    const { message, attachment, author, pageUrl, scriptVersion } = req.body;

    // 4. Создаем красивое сообщение для Discord
    const embed = {
        color: 0x4299e1, // Синий цвет
        author: {
            name: `Новый репорт от ${author}`,
        },
        title: "Сообщение:",
        description: message,
        fields: [],
        footer: {
            text: `Rodina Helper v${scriptVersion} | ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`
        }
    };

    if (attachment) {
        embed.fields.push({ name: "Вложение", value: attachment, inline: false });
    }
    if (pageUrl) {
        embed.fields.push({ name: "Страница", value: pageUrl, inline: false });
    }

    // 5. Отправляем данные на настоящий URL вебхука, который знает только сервер
    try {
        await axios.post(DISCORD_WEBHOOK_URL, {
            username: "Rodina Helper Reports",
            embeds: [embed]
        });
        res.status(200).json({ success: true, message: 'Отчет успешно отправлен.' });
    } catch (error) {
        console.error("Ошибка при отправке в Discord:", error.message);
        res.status(500).json({ success: false, message: 'Не удалось отправить сообщение в Discord.' });
    }
});

app.listen(PORT, () => {
    console.log(`Прокси-сервер Rodina Helper запущен на порту ${PORT}`);
});
