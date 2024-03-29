# GPT Bot

GPT Bot - это Telegram бот, который использует OpenAI API для обработки естественного языка. Бот построен на Node.js и TypeScript и предоставляет простой интерфейс для общения с ChatGPT.

<img src="docs/demo.gif"  height="800"/>

## Особенности

 - Чат с OpenAI GPT (3.5, 4, 4-turbo - модель настраивается в конфиге)
 - Расшифровка голосовых сообщений (понмает войсы на русском и отвечает на них)
 - Сохраненяет контекст разговора
 - Адаптивное урезает истории на основе количества токенов, чтобы не вылезать за лимиты запросов
 - Выбор роли/характера/персонажа бота (предустановленные [подсказки](https://github.com/f/awesome-chatgpt-prompts))
 - Полная кастомизация всех текстовых сообщений от бота через файл конфигурации
 - Конфигурация параметров диалога с ChatGPT
 - Whitelist для ограничения доступа к боту
 - Баланс пользователя в токенах с ограничением при нулевом балансе (БД)
 - Статистика использования токенов для каждого пользователя (БД)

## Начало работы

Для использования бота сначала необходимо создать Telegram бота и получить токен от [Telegram Bot API](https://core.telegram.org/bots#6-botfather). Затем создайте учетную запись в OpenAI и получите ключ API на [OpenAI API](https://platform.openai.com/account/api-keys).

После получения необходимых токенов, склонируйте репозиторий и установите зависимости:

```bash
git clone https://github.com/tikhomirovv/gpt-bot.git
cd gpt-bot
```

Затем создайте файл `.env` и установите следующие переменные окружения:

```
TELEGRAM_BOT_TOKEN=<ваш-токен-Telegram-бота>
OPENAI_API_KEY=<ваш-ключ-OpenAI-API>

# Можно подключить базу для управления пользовательским балансом и отслеживания usage
MONGO_HOST_PORT="localhost:27017"
MONGO_USERNAME=""
MONGO_PASSWORD=""
```

Или выполните команду:

```sh
cp .env.example .env
```

Наконец, запустите бота, выполнив такое:

```bash
yarn dev # локальный запуск в режиме разработки
make build && make run # собрать докер-образ + контейнер и запустить его
```

Теперь вы можете начать общаться с ботом, запустив команду `/start`.

## База данных

MongoDB. Используется для:

 - ведения баланса пользователя в токенах
 - сохранение объема затраченных пользователем токенов

Базу данных использовать **не обязательно**, все связанные с ней функции будут работать только при указании `MONGO_HOST_PORT` в `.env` и успешном подключении.

Существует `cli` команда для пополнения баланса:

```sh
# пополнить баланс пользователя на 10000 токенов
yarn cli tokens-add --telegramId 9988775544 --q 10000
```

## Конфигурация

Можно изменить конфигурацию бота: текст сообщений, настройки для ChatGPT и прочее.
Конфигурация лежит в [./config](). По-умолчанию загружается [default.json](./config/default.json), можно переопределить конфигурацию добавлением файлика с окружением (`{NODE_ENV_VAR}.json`, `production.json` например) или локальный `local.json` / `local-{NOTE_ENV_VAR}.json`.

Подробнее о файлах конфигурации: https://github.com/node-config/node-config/wiki/Configuration-Files#file-load-order
Подробнее о настройках для ChatGPT: https://platform.openai.com/docs/api-reference/chat/create

Будьте внимательны, некоторые сообщения используют формат Markdown, он требует экранирования спец.символов.
Правила экранирования: https://core.telegram.org/bots/api#markdownv2-style

**Whitelist** может быть `null` (отключен) или `(string | number)[]` - списком `username` или `chatId` в Телеграме.

## Команды

Доступны следующие команды:

 - `/start` - запустить бота и получить приветственное сообщение
 - `/character` - настроики характера
 - `/reset` - сбросить контекст (ИИ забудет, о чем был разговор)
 - `/balance` - баланс токенов и статистика пользователя (доступно только с БД)
 - `/terms` - правила использования с кнопкой согласия
 - `/help` - FAQ и прочее


## Внесение изменений

Участие в проекте приветствуется! Если вы нашли ошибку или у вас есть предложения на функцию, откройте задачу в GitHub. Если вы хотите внести изменения в код, сделайте форк репозитория и отправьте запрос на объединение.

## Лицензия

Открытая лицензия MIT - см. [LICENSE](LICENSE).
