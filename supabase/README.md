# Инструкция по настройке email уведомлений

## Что нужно сделать для получения уведомлений на korsyulia@yaandex.ru

### Шаг 1: Настройка Resend (сервис отправки email)

1. Зарегистрируйтесь на https://resend.com/
2. Подтвердите email korsyulia@yaandex.ru как получателя
3. Получите API ключ в разделе API Keys
4. Скопируйте ключ — он понадобится для Edge Function

### Шаг 2: Развёртывание Edge Function

Выполните команды в терминале из корня проекта:

```bash
# Установите Supabase CLI (если не установлен)
npm install -g supabase

# Войдите в аккаунт
supabase login

# Свяжите проект
supabase link --project-ref zfxujjrfphkgqpilnrec

# Установите секрет (RESEND_API_KEY)
supabase secrets set --env-file .env

# Разверните функцию
supabase functions deploy send-email-notification
```

### Шаг 3: Создание .env файла

Создайте файл `.env` в корне проекта:

```
RESEND_API_KEY=re_your_api_key_here
```

Замените `re_your_api_key_here` на ваш реальный ключ от Resend.

### Шаг 4: Настройка webhook в Supabase

1. Откройте SQL Editor в панели Supabase: https://app.supabase.com/project/zfxujjrfphkgqpilnrec/sql
2. Скопируйте содержимое файла `supabase/setup-webhook.sql`
3. **ВАЖНО**: Замените `SERVICE_ROLE` ключ в скрипте на ваш реальный ключ
   - Найти можно в: Settings → API → service_role key
4. Выполните скрипт

### Шаг 5: Включение расширения pg_net

В SQL Editor выполните:

```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

Это нужно для отправки HTTP запросов из базы данных.

### Шаг 6: Тестирование

1. Откройте сайт и заполните форму обратной связи
2. Отправьте форму
3. Проверьте почту korsyulia@yaandex.ru — должно прийти уведомление

---

## Альтернативный вариант (без pg_net)

Если не хотите использовать pg_net, можно отправлять email прямо из `script.js` после сохранения в БД:

```javascript
// После успешного сохранения в Supabase
const response = await fetch('https://zfxujjrfphkgqpilnrec.supabase.co/functions/v1/send-email-notification', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_SERVICE_ROLE_KEY'
  },
  body: JSON.stringify({
    name: name,
    email: email,
    message: comment,
    created_at: new Date().toISOString()
  })
});
```

---

## Структура файлов

```
supabase/
├── functions/
│   └── send-email-notification/
│       └── index.ts          # Edge Function для отправки email
└── setup-webhook.sql         # SQL скрипт для настройки триггера
```

---

## Полезные ссылки

- Документация Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Документация Resend: https://resend.com/docs
- Панель управления Supabase: https://app.supabase.com/
