const fs = require('fs');
const path = require('path');

module.exports = async (message, client, OWNER_NUMBERS) => {
    if (!message.body) return;

    const body = message.body.trim();
    const sender = message.author || message.from;

    const saveOwners = (newList) => {
        const filePath = path.join(__dirname, 'owners.js');
        const content = `module.exports = ${JSON.stringify(newList, null, 4)};`;
        fs.writeFileSync(filePath, content, 'utf8');
    };

    // 1. إضافة صلاحية (/add)
    if (body.startsWith('/add')) {
        if (!OWNER_NUMBERS.includes(sender)) return;

        const target = message.mentionedIds[0];
        if (target) {
            const cleanLID = target.trim();
            if (!OWNER_NUMBERS.includes(cleanLID)) {
                OWNER_NUMBERS.push(cleanLID);
                saveOwners(OWNER_NUMBERS);
                // رسالة إضافة صلاحية بنفس نمط سحب الصلاحية
                await client.sendMessage(message.from, `✅ *〔 إضـافـة صـلاحـيـة 〕* ✅\n\nتم منح الصلاحية لـ @${cleanLID.split('@')[0]} بنجاح!\n👑 الآن أصبح من الملاك.`, { mentions: [cleanLID] });
            } else {
                await message.reply('⚠️ *تنبيـه:* هذا المالك لديه صلاحية بالفعل!');
            }
        }
    }

    // 2. سحب صلاحية (/remove)
    if (body.startsWith('/remove')) {
        if (!OWNER_NUMBERS.includes(sender)) return;

        const target = message.mentionedIds[0];
        if (target) {
            const cleanLID = target.trim();
            const index = OWNER_NUMBERS.indexOf(cleanLID);
            if (index > -1) {
                OWNER_NUMBERS.splice(index, 1);
                saveOwners(OWNER_NUMBERS);
                // رسالة سحب صلاحية
                await client.sendMessage(message.from, `🚫 *〔 سـحـب صـلاحـيـة 〕* 🚫\n\nتم إزالة @${cleanLID.split('@')[0]} من قائمة الملاك بنجاح!`, { mentions: [cleanLID] });
            }
        }
    }

    // 3. عرض القائمة (/ownerlist)
    if (body === '/ownerlist') {
        if (!OWNER_NUMBERS.includes(sender)) return;

        if (OWNER_NUMBERS.length === 0) {
            await message.reply('❌ القائمة لا تحتوي على أي ملاك حالياً!');
        } else {
            let listMsg = `👑〔 *𝐎𝐖𝐍𝐄𝐑 𝐋𝐈𝐒𝐓* 〕👑\n━━━━━━━━━━━━━━\n\n`;
            const list = OWNER_NUMBERS.map((id, i) => `👤 *${i + 1}* - @${id.split('@')[0].trim()}`).join('\n');
            listMsg += list;
            listMsg += `\n\n━━━━━━━━━━━━━━\n🔥 *عـدد الـمـلاك:* ${OWNER_NUMBERS.length}`;
            
            await client.sendMessage(message.from, listMsg, { mentions: OWNER_NUMBERS });
        }
    }
};