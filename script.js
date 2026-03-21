/* анимация курсора */
const canvas = document.getElementById('cursorTrail');
const ctx = canvas.getContext('2d');

let points = [];
let hue = 0;
let animationId;

/* настройка размера */
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resize();
window.addEventListener('resize', resize);

/* обработка движения курсора */
window.addEventListener('mousemove', (e) => {
  hue = (hue + 2) % 360;
  points.push({
    x: e.clientX,
    y: e.clientY,
    age: 0,
    hue: hue,
  });
});

/* анимация */
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* фильтрация старых точек */
  points = points.filter((point) => {
    point.age += 1;
    return point.age < 50;
  });

  /* отрисовка каждой точки */
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const opacity = 1 - point.age / 50;
    const size = (1 - point.age / 50) * 20;

    ctx.beginPath();
    ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${point.hue}, 100%, 60%, ${opacity})`;
    ctx.shadowColor = `hsla(${point.hue}, 100%, 60%, ${opacity})`;
    ctx.shadowBlur = 20;
    ctx.fill();
  }

  animationId = requestAnimationFrame(animate);
}

animate();

/* выпад текст */
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach((item) => {
  const question = item.querySelector('.faq-question');

  question.addEventListener('click', () => {
    const isActive = item.classList.contains('active');

    /* закрытие других */
    faqItems.forEach(otherItem => {
      if (otherItem !== item) {
        otherItem.classList.remove('active');
      }
    });

    /* переключение текущего */
    if (isActive) {
      item.classList.remove('active');
    } else {
      item.classList.add('active');
    }
  });
});

/* форма + отправка в Supabase */
const contactForm = document.getElementById('contactForm');

/* инициализация Supabase через CDN */
const SUPABASE_URL = 'https://zfxujjrfphkgqpilnrec.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmeHVqanJmcGhrZ3FwaWxucmVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMjg4OTYsImV4cCI6MjA4OTcwNDg5Nn0.Csi1noG5_3s8hFoQiEV-ZhqlGL56-6jxENnPlP1_O8E';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = contactForm.querySelector('input[type="text"]');
    const emailInput = contactForm.querySelector('input[type="email"]');
    const commentInput = contactForm.querySelector('textarea');
    const privacyCheckbox = document.getElementById('privacy');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const comment = commentInput.value.trim();
    const privacyChecked = privacyCheckbox.checked;

    /* проверка согласия */
    if (!privacyChecked) {
      alert('Пожалуйста, подтвердите согласие на обработку персональных данных');
      return;
    }

    /* проверка заполненности полей */
    if (!name || !email) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    /* отправка в Supabase */
    try {
      const { data, error } = await supabase
        .from('feedback_messages')
        .insert({
          name: name,
          email: email,
          message: comment,
          consent_given: true,
          status: 'new'
        });

      if (error) {
        throw error;
      }

      alert(`Спасибо, ${name}! Ваше сообщение отправлено.`);
      contactForm.reset();
      console.log('Сообщение сохранено в БД:', data);
    } catch (err) {
      console.error('Ошибка отправки:', err);
      alert('Произошла ошибка при отправке. Попробуйте позже.');
    }
  });
}

/* плавный скролл */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }
    }
  });
});
