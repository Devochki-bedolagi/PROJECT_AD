-- Миграция 001: Создание таблицы для сообщений формы обратной связи
-- Дата: 21.03.2026

CREATE TABLE IF NOT EXISTS feedback_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied'))
);

-- Индекс для быстрой сортировки по дате
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback_messages(created_at DESC);

-- Комментарии к полям
COMMENT ON TABLE feedback_messages IS 'Сообщения из формы обратной связи';
COMMENT ON COLUMN feedback_messages.id IS 'Уникальный идентификатор сообщения';
COMMENT ON COLUMN feedback_messages.created_at IS 'Дата и время отправки сообщения';
COMMENT ON COLUMN feedback_messages.name IS 'Имя отправителя';
COMMENT ON COLUMN feedback_messages.email IS 'Email отправителя';
COMMENT ON COLUMN feedback_messages.message IS 'Текст сообщения';
COMMENT ON COLUMN feedback_messages.consent_given IS 'Факт согласия на обработку персональных данных';
COMMENT ON COLUMN feedback_messages.status IS 'Статус обработки сообщения';
