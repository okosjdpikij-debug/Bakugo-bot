# اختيار نسخة نود مجهزة بـ Puppeteer عشان تخلص من مشاكل المتصفح
FROM ghcr.io/puppeteer/puppeteer:latest

# تحويل المستخدم لـ Root عشان نقدر نثبت الملفات
USER root

# تحديد مكان الشغل جوه السيرفر
WORKDIR /app

# نسخ ملفات التعريف وتثبيت المكتبات
COPY package*.json ./
RUN npm install --network-timeout=1000000

# نسخ باقي ملفات البوت (bot.js, access.js, owners.js)
COPY . .

# أمر التشغيل الأساسي

CMD ["npm", "start"]
