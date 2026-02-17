// jail.js

async function jailLogic(client, message, OWNER_NUMBERS) {
    try {
        const senderLID = message.author || message.from;
        const chat = await message.getChat();
        const chatId = chat.id._serialized; 
        const body = message.body ? message.body.toLowerCase() : '';
        const args = body.split(' ');
        const command = args[0];

        const jailKey = `${senderLID}_${chatId}`;

        // 🛡️ [1. نظام الرقابة الصارم - مسح ملصقات ونصوص]
        if (global.globalJailed.has(jailKey)) {
            const jailData = global.globalJailed.get(jailKey);
            const now = Date.now();

            if (now < jailData.releaseTime) {
                // مسح فوري لأي رسالة أو ملصق
                await message.delete(true).catch(() => {}); 

                jailData.warnings += 1;
                const timeLeft = Math.ceil((jailData.releaseTime - now) / 60000);

                if (jailData.warnings === 1) {
                    await chat.sendMessage(`⚠️ اهدا يا سوابق.. قدامك ${timeLeft} دقيقة ، أي كلمة تانية وهتتطرد!`);
                } 
                else if (jailData.warnings === 2) {
                    await chat.sendMessage(`🚫 اخر مره يا حب هقولك لو اتكلمت تاني هتطلع برا`);
                } 
                else if (jailData.warnings >= 3) {
                    await chat.sendMessage(`🔥معلش يا حبيب قلبي انا قلتلك... يلا برا بقا`);
                    try {
                        await chat.removeParticipants([senderLID]);
                        global.globalJailed.delete(jailKey);
                    } catch (e) {
                        console.log("❌ فشل الطرد: محتاج أدمن");
                    }
                }
                return true; 
            } else {
                global.globalJailed.delete(jailKey);
            }
        }

        // ⚖️ [2. أوامر الإدارة]

        // --- أمر السجن /jail ---
        if (command === '/jail') {
            if (!OWNER_NUMBERS.includes(senderLID)) return false; 
            const mentionedIds = message.mentionedIds;
            if (!mentionedIds || mentionedIds.length === 0) return false;

            const victimId = mentionedIds[0];
            const targetKey = `${victimId}_${chatId}`;
            
            let durationStr = args[2] || '10m'; 
            let durationMs = 0;
            const timeValue = parseInt(durationStr);
            const timeUnit = durationStr.replace(/[0-9]/g, '').toLowerCase();

            if (timeUnit === 'm') durationMs = timeValue * 60000;
            else if (timeUnit === 'h') durationMs = timeValue * 3600000;
            else if (timeUnit === 'd') durationMs = timeValue * 86400000;
            else durationMs = 600000;

            global.globalJailed.set(targetKey, {
                releaseTime: Date.now() + durationMs,
                warnings: 0
            });

            const jailMsg = `⛓️〔 *𝐁𝐀𝐊𝐔𝐆𝐎 𝐏𝐑𝐈𝐒𝐎𝐍* 〕⛓️\n━━━━━━━━━━━━━━━━━━━━\n👤 *الـضـحـيـة :* @${victimId.split('@')[0]}\n⏳ *الـمـدة :* ${durationStr}\n🚫 *الـحـالـة :* الـراجـل بـقـا سـوابـق\n━━━━━━━━━━━━━━━━━━━━\n*“ معاك 3 محاولات لو عديتهم هتطرد برا الجروب ”*`.trim();
            await chat.sendMessage(jailMsg, { mentions: [victimId] });
            return true;
        }

        // --- أمر الفك /unjail ---
        if (command === '/unjail') {
            if (!OWNER_NUMBERS.includes(senderLID)) return false;
            
            const mentionedIds = message.mentionedIds;
            if (!mentionedIds || mentionedIds.length === 0) return false;

            const victimId = mentionedIds[0];
            const targetKey = `${victimId}_${chatId}`;

            if (global.globalJailed.has(targetKey)) {
                global.globalJailed.delete(targetKey);
                const unjailMsg = `🔓〔 *𝐁𝐀𝐊𝐔𝐆𝐎 𝐅𝐑𝐄𝐄𝐃𝐎𝐌* 〕🔓\n━━━━━━━━━━━━━━━━━━━━\n✨ *عـفـو مـلـكـي لـلـمـسـجـون :* @${victimId.split('@')[0]}\n✅ *الـحـالـة :* كـفـارة يـا ابـن بـلـدي\n━━━━━━━━━━━━━━━━━━━━`.trim();
                await chat.sendMessage(unjailMsg, { mentions: [victimId] });
            } else {
                await message.reply("🤔 الشخص ده مش مسجون في الجروب ده يا بطل!");
            }
            return true;
        }

        return false; 
    } catch (error) {
        console.error('⚠️ خطأ في ملف السجن:', error);
        return false;
    }
}

module.exports = { jailLogic };