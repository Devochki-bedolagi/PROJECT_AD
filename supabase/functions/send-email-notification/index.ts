// Supabase Edge Function для отправки email уведомлений
// Разместить в: supabase/functions/send-email-notification/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFICATION_EMAIL = "korsyulia@yaandex.ru";

const RESEND_API_URL = "https://api.resend.com/emails";

interface FeedbackMessage {
  name: string;
  email: string;
  message: string;
  created_at: string;
}

serve(async (req) => {
  try {
    // Получаем данные из webhook payload
    const payload = await req.json();
    
    // Supabase webhook отправляет данные в формате { record: {...}, type: "INSERT" }
    const record = payload.record as FeedbackMessage;
    
    if (!record) {
      throw new Error("Отсутствуют данные записи");
    }

    // Формируем email
    const emailData = {
      from: "Local Music Party <onboarding@resend.dev>", // Resend предоставляет этот домен по умолчанию
      to: [NOTIFICATION_EMAIL],
      subject: `Новое сообщение от ${record.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6B46C1; border-bottom: 2px solid #6B46C1; padding-bottom: 10px;">
            Новое сообщение с сайта Local Music Party
          </h2>
          
          <div style="background-color: #F7FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;">
              <strong style="color: #4A5568;">Имя отправителя:</strong> 
              <span style="color: #2D3748;">${record.name}</span>
            </p>
            
            <p style="margin: 10px 0;">
              <strong style="color: #4A5568;">Email отправителя:</strong> 
              <a href="mailto:${record.email}" style="color: #6B46C1;">${record.email}</a>
            </p>
            
            <p style="margin: 10px 0;">
              <strong style="color: #4A5568;">Дата отправки:</strong> 
              <span style="color: #2D3748;">${new Date(record.created_at).toLocaleString('ru-RU')}</span>
            </p>
          </div>
          
          <div style="background-color: #EDF2F7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #4A5568; margin-top: 0;">Сообщение:</h3>
            <p style="color: #2D3748; line-height: 1.6; white-space: pre-wrap;">${record.message || "Без сообщения"}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E2E8F0;">
            <p style="color: #718096; font-size: 12px;">
              Это автоматическое уведомление от системы Local Music Party
            </p>
          </div>
        </div>
      `,
    };

    // Отправляем email через Resend API
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Ошибка отправки email: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email уведомление отправлено",
        emailId: result.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Ошибка в функции send-email-notification:", error);

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
