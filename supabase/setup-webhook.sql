-- SQL скрипт для создания webhook триггера в Supabase
-- Выполнить в SQL Editor вашего Supabase проекта

-- Функция для отправки webhook при новой записи
CREATE OR REPLACE FUNCTION notify_new_feedback()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT;
  payload JSON;
BEGIN
  -- URL вашей Edge Function (замените YOUR_PROJECT_REF на реальный)
  webhook_url := 'https://zfxujjrfphkgqpilnrec.supabase.co/functions/v1/send-email-notification';
  
  -- Формируем payload
  payload := json_build_object(
    'record', json_build_object(
      'id', NEW.id,
      'name', NEW.name,
      'email', NEW.email,
      'message', NEW.message,
      'consent_given', NEW.consent_given,
      'status', NEW.status,
      'created_at', NEW.created_at
    ),
    'type', 'INSERT'
  );
  
  -- Отправляем webhook (асинхронно, не блокируя основную транзакцию)
  PERFORM net.http_post(
    url := webhook_url,
    body := payload,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmeHVqanJmcGhrZ3FwaWxucmVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDEyODg5NiwiZXhwIjoyMDg5NzA0ODk2fQ.XYZ' -- Замените на SERVICE_ROLE ключ
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаём триггер на таблицу feedback_messages
DROP TRIGGER IF EXISTS on_new_feedback ON feedback_messages;

CREATE TRIGGER on_new_feedback
  AFTER INSERT ON feedback_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_feedback();

-- Примечание: Для работы http_post нужно расширение pg_net
-- Включить его можно так:
-- CREATE EXTENSION IF NOT EXISTS pg_net;
