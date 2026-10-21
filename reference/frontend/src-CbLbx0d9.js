
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="9a6b38ba-ca72-53c3-8de2-a103156acebd")}catch(e){}}();
var e=`2025-12-18T00:00:00.000Z`,t=new Set([`default`]);function n(e){return!t.has(e.id)}var r=[{id:`default`,name:`Default`,description:`Cleans up punctuation and grammar while keeping your tone. Adds paragraphs or lists when they help.`,kind:`builtin`,promptTemplate:`Write the transcript as clean, natural written text.

- Preserve the speaker's voice, tone, and level of formality — don't make it sound more formal or more casual than how it was spoken.
- Apply correct punctuation, capitalization, and grammar.
- Keep questions as questions and statements as statements.
- Write numbers as numerals ("five" → "5", "twenty dollars" → "$20").
- Use short paragraphs when helpful for readability.
- Format lists as proper bullet points or numbered lists when the speaker enumerates items.`,tags:[],applicationIds:[],websiteHosts:[],createdAt:e,updatedAt:e},{id:`email`,name:`Email`,description:`Formats your dictation as a polished email with clear paragraphs. Keeps any greeting or closing you dictate.`,icon:`command-transcription-style-email`,kind:`builtin`,promptTemplate:`Format the transcript as a polished email.

- Apply correct punctuation, capitalization, and grammar.
- Write numbers as numerals.
- Match the surrounding thread's level of formality when clear — stay warm if the thread is warm, more professional if the thread is more formal.
- Structure the body with clear, short, paragraphing and natural flow.
- If the user included a greeting or closing, keep it and format it correctly ("Hi", "Hey", "Dear [Name]", "Best Regards,", "Best,", "Cheers, [Name]", etc.), otherwise do not add a greeting or closing.
- Do not use bullet points unless the user clearly dictated a list or the thread strongly suggests list formatting.
- Do not add a subject line.`,tags:[],applicationIds:[`com.apple.mail`,`com.microsoft.Outlook`,`com.google.Gmail`,`com.readdle.smartemail-macos`,`com.superhuman.electron`,`com.airmail.Airmail-Beta`,`com.bloop.airmail.macOS`,`it.bloop.airmail2`,`com.freron.MailMate`,`com.postbox-inc.postbox`,`com.mimestream.Mimestream`,`me.proton.mail`,`com.canary.mail`,`com.hey.app.desktop`,`app.missiveapp.mac`,`com.busymac.mail3`,`com.fastmail.app`,`com.edison.mail`,`com.frontapp.Front`,`Microsoft.OutlookForWindows_8wekyb3d8bbwe`,`olk.exe`,`Microsoft.Office.OUTLOOK.EXE.15`,`OUTLOOK.EXE`],websiteHosts:[`mail.google.com`,`outlook.live.com`,`outlook.office.com`,`outlook.office365.com`,`mail.yahoo.com`,`mail.proton.me`,`app.hey.com`,`app.fastmail.com`,`mail.zoho.com`],createdAt:e,updatedAt:e},{id:`messaging`,name:`Messaging`,description:`Formats your dictation as a casual message with simple wording and minimal formatting.`,icon:`command-transcription-style-messaging`,kind:`builtin`,promptTemplate:`Format the transcript as a casual written message.

- Keep it natural, concise, and human.
- Preserve the speaker's voice while lightly smoothing spoken phrasing into readable text.
- Match the tone of the surrounding conversation when available.
- Prefer direct, everyday wording.
- Apply correct punctuation and capitalization by default, but preserve lowercase or otherwise informal stylistic tone if the surrounding conversation clearly uses it.
- Do not make the result sound like a formal email unless the surrounding context clearly requires that tone.
- Do not add greetings or sign-offs unless they are clearly natural in the existing conversation.
- Keep formatting minimal.
- Do not use bullet points unless the user clearly dictated a list or the surrounding conversation strongly suggests list formatting.`,tags:[],applicationIds:[`com.apple.MobileSMS`,`net.whatsapp.WhatsApp`,`org.whispersystems.signal-desktop`,`ru.keepcoder.Telegram`,`com.hnc.Discord`,`com.facebook.archon`,`com.tencent.xinWeChat`,`jp.naver.line.mac`,`com.microsoft.teams`,`com.microsoft.teams2`,`com.tinyspeck.slackmacgap`,`com.viber.osx`,`com.skype.skype`,`5319275A.WhatsAppDesktop_cv1g1gvanyjgm`,`91750D7E.Slack_8she8kybcnzg4`,`MSTeams_8wekyb3d8bbwe`,`Telegram.TelegramDesktop`,`com.squirrel.Discord.Discord`],websiteHosts:[`web.whatsapp.com`,`web.telegram.org`,`messenger.com`,`discord.com`,`slack.com`,`teams.microsoft.com`,`chat.google.com`,`messages.google.com`],createdAt:e,updatedAt:e}],i=`This transcription failed`;function a(e){let t=[],n=new Set;for(let r of e){if(typeof r!=`string`)continue;let e=r.trim();if(!(e.length===0||e.length>20||n.has(e))&&(t.push(e),n.add(e),t.length>=50))break}return t}export{n as i,a as n,r,i as t};
//# sourceMappingURL=src-CbLbx0d9.js.map
//# debugId=9a6b38ba-ca72-53c3-8de2-a103156acebd
