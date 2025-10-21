const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Разрешаем запросы (в будущем можно ограничить только доменом форума)
app.use(cors());
app.use(express.json());

// Наша единственная точка входа
app.post('/api/feedback', async (req, res) => {
    // Получаем данные, которые отправило расширение
    const { webhookUrl, message, attachment, author, pageUrl, scriptVersion } = req.body;

    // Проверка безопасности: URL вебхука должен быть передан в запросе
    if (!webhookUrl) {
        return res.status(400).json({ success: false, message: 'Webhook URL не был предоставлен.' });
    }

    // Создаем красивое встраиваемое сообщение (embed) для Discord
    const embed = {
        color: 0x4299e1, // Синий цвет
        author: {
            name: `Новый репорт от ${author}`,
        },
        title: "Сообщение:",
        description: message,
        fields: [],
        footer: {
            text: `Rodina Helper v${scriptVersion} | ${new Date().toLocaleString()}`
        }
    };

    if (attachment) {
        embed.fields.push({ name: "Вложение", value: attachment, inline: false });
    }

    if (pageUrl) {
        embed.fields.push({ name: "Страница", value: pageUrl, inline: false });
    }

    // Отправляем данные на настоящий URL вебхука
    try {
        await axios.post(webhookUrl, {
            username: "Rodina Helper Reports", // Имя бота в Discord
            embeds: [embed]
        });
        res.status(200).json({ success: true, message: 'Отчет успешно отправлен.' });
    } catch (error) {
        console.error("Ошибка при отправке в Discord:", error.message);
        res.status(500).json({ success: false, message: 'Не удалось отправить сообщение в Discord.' });
    }
});

app.listen(PORT, () => {
    console.log(`Прокси-сервер запущен на порту ${PORT}`);
});