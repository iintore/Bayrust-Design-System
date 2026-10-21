
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="f9885dba-9a86-553c-a5b3-04a89ad7e514")}catch(e){}}();
import{n as e}from"./logger-DNVmeXhU.js";import{t}from"./time-BgPLLP_H.js";import{l as n,o as r,s as i}from"./src-6_EuYEmh.js";import{a,n as o,o as s,r as c}from"./startOfDay-DrIqsFn5.js";import{t as l}from"./ulid-mOtZWy6P.js";import{t as u}from"./services-CI1JjB8Y.js";import{t as d}from"./command-icons-CrAR_roK.js";import{W as f,r as p}from"./ai-extension-R40i_hUJ.js";import{n as m}from"./attachments-hQImwAZk.js";import{t as h}from"./is-icon-KGU-nb7T.js";import{Q as g}from"./internal-extensions-DTEJ6vg9.js";import{o as _}from"./extension-command-ids-CA_nvWjo.js";import{t as v}from"./visibility-level-DscUtuef.js";import{n as ee,t as y}from"./ai-models-store-DRn4Jp4E.js";import{n as b}from"./query-keys-Cwg6K0nl.js";import{n as x,t as te}from"./transcription-styles-constants-kamIntN-.js";import{r as S}from"./src-CbLbx0d9.js";var C=[`ai-command-tags`];function w(e,t){let n=()=>c(t?.in,NaN),r=t?.additionalDigits??2,i=D(e),a;if(i.date){let e=O(i.date,r);a=k(e.restDateString,e.year)}if(!a||isNaN(+a))return n();let s=+a,l=0,u;if(i.time&&(l=j(i.time),isNaN(l)))return n();if(i.timezone){if(u=N(i.timezone),isNaN(u))return n()}else{let e=new Date(s+l),n=o(0,t?.in);return n.setFullYear(e.getUTCFullYear(),e.getUTCMonth(),e.getUTCDate()),n.setHours(e.getUTCHours(),e.getUTCMinutes(),e.getUTCSeconds(),e.getUTCMilliseconds()),n}return o(s+l+u,t?.in)}var T={dateTimeDelimiter:/[T ]/,timeZoneDelimiter:/[Z ]/i,timezone:/([Z+-].*)$/},ne=/^-?(?:(\d{3})|(\d{2})(?:-?(\d{2}))?|W(\d{2})(?:-?(\d{1}))?|)$/,re=/^(\d{2}(?:[.,]\d*)?)(?::?(\d{2}(?:[.,]\d*)?))?(?::?(\d{2}(?:[.,]\d*)?))?$/,E=/^([+-])(\d{2})(?::?(\d{2}))?$/;function D(e){let t={},n=e.split(T.dateTimeDelimiter),r;if(n.length>2)return t;if(/:/.test(n[0])?r=n[0]:(t.date=n[0],r=n[1],T.timeZoneDelimiter.test(t.date)&&(t.date=e.split(T.timeZoneDelimiter)[0],r=e.substr(t.date.length,e.length))),r){let e=T.timezone.exec(r);e?(t.time=r.replace(e[1],``),t.timezone=e[1]):t.time=r}return t}function O(e,t){let n=RegExp(`^(?:(\\d{4}|[+-]\\d{`+(4+t)+`})|(\\d{2}|[+-]\\d{`+(2+t)+`})$)`),r=e.match(n);if(!r)return{year:NaN,restDateString:``};let i=r[1]?parseInt(r[1]):null,a=r[2]?parseInt(r[2]):null;return{year:a===null?i:a*100,restDateString:e.slice((r[1]||r[2]).length)}}function k(e,t){if(t===null)return new Date(NaN);let n=e.match(ne);if(!n)return new Date(NaN);let r=!!n[4],i=A(n[1]),a=A(n[2])-1,o=A(n[3]),s=A(n[4]),c=A(n[5])-1;if(r)return z(t,s,c)?P(t,s,c):new Date(NaN);{let e=new Date(0);return!L(t,a,o)||!R(t,i)?new Date(NaN):(e.setUTCFullYear(t,a,Math.max(i,o)),e)}}function A(e){return e?parseInt(e):1}function j(e){let t=e.match(re);if(!t)return NaN;let n=M(t[1]),r=M(t[2]),i=M(t[3]);return B(n,r,i)?n*a+r*s+i*1e3:NaN}function M(e){return e&&parseFloat(e.replace(`,`,`.`))||0}function N(e){if(e===`Z`)return 0;let t=e.match(E);if(!t)return 0;let n=t[1]===`+`?-1:1,r=parseInt(t[2]),i=t[3]&&parseInt(t[3])||0;return V(r,i)?n*(r*a+i*s):NaN}function P(e,t,n){let r=new Date(0);r.setUTCFullYear(e,0,4);let i=r.getUTCDay()||7,a=(t-1)*7+n+1-i;return r.setUTCDate(r.getUTCDate()+a),r}var F=[31,null,31,30,31,30,31,31,30,31,30,31];function I(e){return e%400==0||e%4==0&&e%100!=0}function L(e,t,n){return t>=0&&t<=11&&n>=1&&n<=(F[t]||(I(e)?29:28))}function R(e,t){return t>=1&&t<=(I(e)?366:365)}function z(e,t,n){return t>=1&&t<=53&&n>=0&&n<=6}function B(e,t,n){return e===24?t===0&&n===0:n>=0&&n<60&&t>=0&&t<60&&e>=0&&e<25}function V(e,t){return t>=0&&t<=59}var H={"improve-writing":`Act as a spelling corrector, content writer, and text improver/editor. Reply only with the rewritten text and nothing else.

Strictly follow these rules:
- Correct spelling, grammar, and punctuation errors in the given text
- Enhance clarity and conciseness without altering the original meaning
- Divide lengthy sentences into shorter, more readable ones
- Eliminate unnecessary repetition while preserving important points
- Prioritize active voice over passive voice for a more engaging tone
- Opt for simpler, more accessible vocabulary when possible
- ALWAYS ensure the original meaning and intention of the given text
- ALWAYS detect and maintain the original language of the given text
- ALWAYS maintain the existing tone of voice and style, e.g. formal, casual, polite, etc.
- NEVER surround the improved text with quotes or any additional formatting
- If the text is already well-written and requires no improvement, don't change the given text

Text to improve:
{selection}

Improved text:`,"fix-spelling-grammar":`Act as a spelling corrector and improver. Reply only with the rewritten text and nothing else.

Strictly follow these rules:
- Correct spelling, grammar and punctuation
- ALWAYS detect and maintain the original language of the given text
- NEVER surround the rewritten text with quotes
- Don't replace urls with markdown links
- Don't change emojis

Text to rewrite:
{selection}

Rewritten text:`,"explain-this-in-simple-terms":`Act as a dictionary and encyclopedia, providing clear and concise explanations for given words or concepts.

Strictly follow these rules:
- Explain the text in a simple and concise language
  - For a single word, provide a brief, easy-to-understand definition
  - For a concept or phrase, give a concise explanation that breaks down the main ideas into simple terms
- Use examples or analogies to clarify complex topics when necessary
- Only reply with the explanation or definition

Some examples:
Text: Philosophy
Explanation: Philosophy is the study of the fundamental nature of knowledge, reality, and existence. It is a system of ideas that attempts to explain the world and our place in it. Philosophers use logic and reason to explore the meaning of life and the universe.

Text:
{selection}

Explanation:`,"change-tone-to-professional":`Act as a professional content writer and editor. Reply only with the rewritten text and nothing else.

Strictly follow these rules:
- Professional tone of voice
- Formal language
- Accurate facts
- Correct spelling, grammar, and punctuation
- Concise phrasing
- meaning unchanged
- Length retained
- Don't replace urls with markdown links
- ALWAYS detect and maintain the original language of the given text

Text:
{selection}

Rewritten text:`,"change-tone-to-friendly":`Act as a content writer and editor. Reply only with the rewritten text and nothing else.

Strictly follow these rules:
- Friendly and optimistic tone of voice
- Correct spelling, grammar, and punctuation
- Meaning unchanged
- Length retained
- Don't replace urls with markdown links
- ALWAYS detect and maintain the original language of the given text

Text:
{selection}

Rewritten text:`,"find-bugs":`Act as a software engineer with deep understanding of any programming language. Review the code to fix logical bugs in the code. Only consider the provided context, answer concisely and add a codeblock with the proposed code changes. If you can't confidently find bugs, answer with "Nothing found - LGTM 👍".

Code:
\`\`\`tsx
function PrevAction() {
  const [page, setPage] = useGlobalState("page");
  return (
    <Action
      title="Go to Previous Page"
      onAction={() => setPage(page - 1)}
    />
  );
}
\`\`\`

Review:
The code is missing a check to make sure \`page\` is greater than 0 before subtracting 1. Otherwise, the page could be set to -1 which might cause unexpected behavior.
\`\`\`tsx
function PrevAction() {
  const [page, setPage] = useGlobalState("page");
  return (
    <Action
      title="Go to Previous Page"
      onAction={() => setPage(Math.max(page - 1, 0))}
    />
  );
}
\`\`\`

Code:
\`\`\`swift
private func submit(_ text: String) {
  guard !text.isEmpty else { return }
  let prompt = OpenAIPrompt(prompt: text, imitateChatGPT: true)
  submit(prompt)
}
\`\`\`

Review:
Nothing found - LGTM 👌

Code:
\`\`\`\`
{selection | raw}
\`\`\`\`

Review:`,"summarize-website":`You are a skilled website summarizer. You write a summary of the provided webpage that includes all key details that you would share with a friend. Analyze the given website content and create a summary using the following format:
\`\`\`
## <concise title that captures the main theme of the website>

<one to two sentence summary that encapsulates the key information information>

### Key Takeaways

- <Three bullet points with the key takeaways, keep them concise>
\`\`\`

Strictly follow these rules:
- Maintain the author's perspective and arguments from an observer's point of view
- Prioritize the most important, interesting, and unique facts for the reader
- Only include information explicitly stated in the website content
- Keep the summary concise, but ensure that all key information is included

Here's the website content.

---

Title: {browser-tab.title | raw}
URL: {browser-tab.url | raw}

{browser-tab.content format="markdown" | raw}

---

Summary:`,"answer-question-about-website":`You are a research assistant that provides accurate, concise answers to questions about the content of a given webpage. Strictly follow these rules:
- Only include information mentioned in the webpage
  - If the webpage lacks the necessary information to answer the question, respond with "Information not found on the website"
- If the webpage answers the question directly, provide a brief, factual summary and relevant quote
  - NEVER use phrases like "According to the webpage", "The webpage states", "The website explains", etc.
- Be as concise as possible, ideally one sentence
- NEVER add commentary, opinions, or extra information

Answer the following question:
{argument name="Question"}

Here's the website content.

---

Title: {browser-tab.title | raw}
URL: {browser-tab.url | raw}

{browser-tab.content format="markdown" | raw}

---

Answer:`};function U(e,t){let i=e.id??l(),a=e.createdAt??new Date,o=n(`catalogItem:${i}`,{...t,updatedAt:e.updatedAt??new Date,isSaved:e.isSaved??!1},{compare:r});return{id:i,createdAt:a,state:o,get:o.get,update:e=>o.set(t=>({...t,...e}))}}function W(e){let t=n(`catalogModels`,new Map),r=n(`catalogStatus`,`idle`),a,o=!1;function s(e){return d()?.catch(()=>void 0),t.get().get(e)}function c(e){let n=Array.from(t.get().values());for(let e of n)e.state.get();return n.sort(e)}function l(){return o=!0,u()}async function u(){return a||(r.get()!==`loaded`&&r.set(`loading`),a=(async()=>{try{do{o=!1;try{let n=await Promise.resolve().then(()=>e.getAll());i(()=>{let i=t.peek(),a=new Map;for(let t of n){let n=i.get(t.id);n&&e.applyDTO(t,n),a.set(t.id,n??e.fromDTO(t))}t.set(a),r.set(`loaded`)})}catch(e){if(o)continue;throw r.peek()!==`loaded`&&r.set(`error`),e}}while(o)}finally{a=void 0}})(),a)}function d(){if(r.get()!==`loaded`)return u()}function f(n){r.get()===`loaded`||a||i(()=>{t.set(new Map(n.map(t=>[t.id,e.fromDTO(t)]))),r.set(`loaded`)})}async function p(n,r=!1){if(!n.get().isSaved&&!r)return;let a=!t.peek().has(n.id),{isSaved:o,updatedAt:s}=n.get();i(()=>{a&&t.set(e=>new Map(e).set(n.id,n)),o&&n.update({updatedAt:new Date})});try{await e.save(e.toDTO(n)),n.update({isSaved:!0})}catch(e){throw i(()=>{a&&h(n.id),o&&n.update({updatedAt:s})}),e}}async function m(t){await e.delete(e.toDTO(t)),h(t.id)}function h(e){t.set(t=>{let n=new Map(t);return n.delete(e),n})}return{get loadingState(){return r.get()},get isLoading(){return d()?.catch(()=>void 0),r.get()===`loading`},get isLoaded(){return d()?.catch(()=>void 0),r.get()===`loaded`},getById:s,getObjects:c,load:u,reload:l,loadInitial:d,hydrate:f,save:p,delete:m}}var G=[{id:`improve-writing`,name:`Improve Writing`,icon:d.standard.ai.improveWriting,kind:`builtin`,creativity:`low`,promptTemplate:H[`improve-writing`],isSaved:!0,createdAt:w(`2025-12-18`),updatedAt:w(`2025-12-18`)},{id:`fix-spelling-grammar`,name:`Fix Spelling and Grammar`,icon:d.standard.ai.fixSpelling,kind:`builtin`,creativity:`none`,promptTemplate:H[`fix-spelling-grammar`],highlightEdits:!0,isSaved:!0,createdAt:w(`2025-12-18`),updatedAt:w(`2025-12-18`)},{id:`explain-this-in-simple-terms`,name:`Explain This in Simple Terms`,icon:d.standard.ai.explainSimpleTerms,kind:`builtin`,creativity:`none`,promptTemplate:H[`explain-this-in-simple-terms`],isSaved:!0,createdAt:w(`2025-12-18`),updatedAt:w(`2025-12-18`)},{id:`change-tone-to-professional`,name:`Change Tone to Professional`,icon:d.standard.ai.changeToneProfessional,kind:`builtin`,creativity:`low`,promptTemplate:H[`change-tone-to-professional`],isSaved:!0,createdAt:w(`2025-12-18`),updatedAt:w(`2025-12-18`)},{id:`change-tone-to-friendly`,name:`Change Tone to Friendly`,icon:d.standard.ai.changeToneFriendly,kind:`builtin`,creativity:`low`,promptTemplate:H[`change-tone-to-friendly`],isSaved:!0,createdAt:w(`2025-12-18`),updatedAt:w(`2025-12-18`)},{id:`find-bugs`,name:`Find Bugs in Code`,icon:d.standard.ai.findBugs,kind:`builtin`,creativity:`medium`,promptTemplate:H[`find-bugs`],isSaved:!0,createdAt:w(`2025-12-18`),updatedAt:w(`2025-12-18`)},{id:`summarize-website`,name:`Summarize Webpage`,icon:d.standard.ai.summarizeWebsite,kind:`builtin`,creativity:`low`,promptTemplate:H[`summarize-website`],isSaved:!0,createdAt:w(`2025-12-18`),updatedAt:w(`2025-12-18`)},{id:`answer-question-about-website`,name:`Ask About Webpage`,icon:d.standard.ai.askWebpage,kind:`builtin`,creativity:`none`,promptTemplate:H[`answer-question-about-website`],isSaved:!0,createdAt:w(`2025-12-18`),updatedAt:w(`2025-12-18`)}];for(let e of G)e.promptTemplateMentionFormat=m;function K(){let e=W({getAll:()=>u.ipc.backend.ai.getCommands(),save:e=>u.ipc.backend.ai.saveCommand(e),delete:e=>u.ipc.backend.ai.deleteCommand(e.id),fromDTO:e=>t({...e,reasoningEffort:e.reasoningEffort??void 0,tags:e.tags??[],organization:e.organization,organizationHandle:e.organizationHandle,createdAt:new Date(e.createdAt),updatedAt:new Date(e.updatedAt),isSaved:!0}),toDTO:e=>{let t=e.get();return{id:e.id,name:t.name,icon:t.icon,kind:t.kind,modelId:t.modelId,creativity:t.creativity,reasoningEffort:t.reasoningEffort,routingPreference:t.routingPreference,promptTemplate:t.promptTemplate,promptTemplateMentionFormat:t.promptTemplateMentionFormat,applicationId:t.applicationId,highlightEdits:t.highlightEdits,outputBehavior:t.outputBehavior,tags:t.tags,organization:t.organization,organizationHandle:t.organizationHandle,createdAt:e.createdAt.toISOString(),updatedAt:t.updatedAt.toISOString()}},applyDTO:(e,t)=>{let n=t.get();t.update({name:e.name,icon:e.icon,kind:e.kind,modelId:e.modelId,creativity:e.creativity,reasoningEffort:e.reasoningEffort??void 0,routingPreference:e.routingPreference,promptTemplate:e.promptTemplate,promptTemplateMentionFormat:e.promptTemplateMentionFormat,applicationId:e.applicationId,highlightEdits:e.highlightEdits,outputBehavior:p(e.outputBehavior),tags:JSON.stringify(e.tags??[])===JSON.stringify(n.tags)?n.tags:e.tags??[],organization:JSON.stringify(e.organization)===JSON.stringify(n.organization)?n.organization:e.organization,organizationHandle:e.organizationHandle,updatedAt:e.updatedAt===n.updatedAt.toISOString()?n.updatedAt:new Date(e.updatedAt)})}});function t(t={}){let n={...U(t,{name:t.name??``,icon:t.icon,kind:t.kind??`custom`,modelId:t.modelId,creativity:t.creativity,reasoningEffort:t.reasoningEffort,routingPreference:t.routingPreference,promptTemplate:t.promptTemplate,promptTemplateMentionFormat:t.promptTemplateMentionFormat,applicationId:t.applicationId,highlightEdits:t.highlightEdits??!1,outputBehavior:p(t.outputBehavior),tags:t.tags??[],organization:t.organization,organizationHandle:t.organizationHandle}),get iconDisplay(){let{icon:e}=n.get();return e&&h(e)?e:`stars`},get nameDisplay(){let{name:e,isSaved:t}=n.get();return e||(t?`Unnamed Command`:`New Command`)},save:(t=!1)=>e.save(n,t),delete:()=>e.delete(n)};return n}let n=G.map(e=>t(e));return{create:t,get commands(){return[...n,...e.getObjects((e,t)=>e.get().name.localeCompare(t.get().name))]},get isLoading(){return e.isLoading},get isLoaded(){return e.isLoaded},load(){return e.reload()},loadInitial(){return e.loadInitial()},getById(t){return n.find(e=>e.id===t)||e.getById(t)}}}var q=[{id:`research`,name:`Deep Research`,icon:`bolt`,modelId:`perplexity-sonar-pro`,availability:`public`,systemInstructions:`You are a helpful AI assistant optimized for deep research. Be concise and efficient.`,default:!0,isSaved:!0,createdAt:w(`2025-12-18`),updatedAt:w(`2025-12-18`)},{id:`coding`,name:`Coding Expert`,icon:`code`,modelId:`openai-gpt-5.5`,availability:`internal`,systemInstructions:`You are an expert programming assistant. Focus on writing clean, efficient, and well-documented code.`,default:!0,isSaved:!0,createdAt:w(`2025-12-18`),updatedAt:w(`2025-12-18`)}];function J(e){return v(e.availability===`internal`?`internal`:`production`)}function Y(){return q.filter(J)}function X(){let e=W({getAll:()=>u.ipc.backend.ai.getModes(),save:e=>u.ipc.backend.ai.saveMode(e),delete:e=>u.ipc.backend.ai.deleteMode(e.id),fromDTO:e=>t({...e,organization:e.organization,organizationHandle:e.organizationHandle,createdAt:new Date(e.createdAt),updatedAt:new Date(e.updatedAt),isSaved:!0}),toDTO:e=>{let t=e.get();return{id:e.id,name:t.name,icon:t.icon,modelId:t.modelId,creativity:t.creativity,systemInstructions:t.systemInstructions,additionalTools:t.additionalTools,reasoningEffort:t.reasoningEffort,organization:t.organization,organizationHandle:t.organizationHandle,createdAt:e.createdAt.toISOString(),updatedAt:t.updatedAt.toISOString()}},applyDTO:(e,t)=>{let n=t.get(),r=e.additionalTools??[],i=r.length===n.additionalTools.length&&r.every((e,t)=>e.id===n.additionalTools[t]?.id&&e.name===n.additionalTools[t]?.name);t.update({name:e.name,icon:e.icon,modelId:e.modelId,creativity:e.creativity,systemInstructions:e.systemInstructions,additionalTools:i?n.additionalTools:r,reasoningEffort:e.reasoningEffort,organization:JSON.stringify(e.organization)===JSON.stringify(n.organization)?n.organization:e.organization,organizationHandle:e.organizationHandle,updatedAt:e.updatedAt===n.updatedAt.toISOString()?n.updatedAt:new Date(e.updatedAt)})}});function t(t={}){let n={...U(t,{name:t.name??``,icon:t.icon,modelId:t.modelId,systemInstructions:t.systemInstructions,additionalTools:t.additionalTools??[],reasoningEffort:t.reasoningEffort,creativity:t.creativity,default:t.default??!1,availability:t.availability,organization:t.organization,organizationHandle:t.organizationHandle}),get iconDisplay(){let{icon:e}=n.get();return e&&h(e)?e:`stars`},get nameDisplay(){let{name:e,isSaved:t}=n.get();return e.trim()||(t?`Unnamed Agent`:`New Agent`)},save(t=!1){let r=n.get();if(r.default)throw Error(`Default agents cannot be saved`);let i=r.name.trim();if(!i)throw Error(`Agent name cannot be empty`);return n.update({name:i}),e.save(n,t)},delete:()=>e.delete(n)};return n}let n=Y().map(e=>t(e)),r={create:t,get customModes(){return e.getObjects((e,t)=>e.get().name.localeCompare(t.get().name))},get defaultModes(){return n},get modes(){return[...r.customModes,...r.defaultModes]},get isLoading(){return e.isLoading},get isLoaded(){return e.isLoaded},load(){return e.reload()},loadInitial(){return e.loadInitial()},hydrate(t){e.hydrate(t)},getById(t){return n.find(e=>e.id===t)||e.getById(t)}};return r}var ie=f;function ae(e){let r=n(`catalogFetcher`,{data:void 0,status:`idle`}),i=e.cacheDuration===`infinite`?1/0:t(e.cacheDuration),a=e.cacheDurationFailure?t(e.cacheDurationFailure):i,o,s,c,l=!1;async function u({force:t=!1}={}){if(c)return l||=t,c;if(!(!t&&f()))return s!==void 0&&(window.clearTimeout(s),s=void 0),c=(async()=>{try{do{l=!1,o=Date.now(),r.set(e=>e.status===`succeeded`?e:{...e,status:`loading`});try{let t=await Promise.resolve().then(()=>e.fetch());o=Date.now(),r.set(e=>({data:JSON.stringify(t)===JSON.stringify(e.data)?e.data:t,status:`succeeded`}))}catch(e){if(l)continue;throw o=Date.now(),r.set(e=>e.status===`succeeded`?e:{...e,status:`failed`}),e}}while(l)}finally{c=void 0}})(),c}function d(){s!==void 0||c||f()||(s=window.setTimeout(()=>{s=void 0,u().catch(()=>void 0)}))}function f(){if(o===void 0)return!1;let e=r.peek().status===`failed`?a:i;return Date.now()-o<e}return{get data(){return d(),r.get().data},get hasData(){return r.get().data!==void 0},get dataAsPromise(){return d(),r.peek().status===`succeeded`?Promise.resolve(r.peek().data):u().then(()=>{let e=r.peek();if(e.status===`succeeded`)return e.data;throw Error(`Failed to fetch data`)})},get isLoading(){d();let{status:e}=r.get();return e===`idle`||e===`loading`},get isLoaded(){return d(),r.get().status===`succeeded`},get isFailed(){return d(),r.get().status===`failed`},fetch:u}}function oe(e){return e.fetchQuery({queryKey:[b],queryFn:()=>u.ipc.backend.ai.getModels(),staleTime:3e3})}function se(e){return ae({fetch:()=>oe(e),cacheDuration:{minutes:15},cacheDurationFailure:{seconds:10}})}function ce(e){return y(se(e))}function Z(){let t=W({getAll:()=>u.ipc.backend.ai.getTranscriptionStyles(),save:e=>u.ipc.backend.ai.saveTranscriptionStyle(e),delete:e=>u.ipc.backend.ai.deleteTranscriptionStyle(e.id),fromDTO:e=>r($(e)),toDTO:n,applyDTO:(e,t)=>{let n=t.get();t.update({name:e.name,icon:e.icon,kind:e.kind,promptTemplate:e.promptTemplate,tags:JSON.stringify(e.tags??[])===JSON.stringify(n.tags)?n.tags:e.tags??[],applicationIds:JSON.stringify(e.applicationIds??[])===JSON.stringify(n.applicationIds)?n.applicationIds:e.applicationIds??[],websiteHosts:JSON.stringify(e.websiteHosts??[])===JSON.stringify(n.websiteHosts)?n.websiteHosts:e.websiteHosts??[],organization:JSON.stringify(e.organization)===JSON.stringify(n.organization)?n.organization:e.organization,organizationHandle:e.organizationHandle,updatedAt:e.updatedAt===n.updatedAt.toISOString()?n.updatedAt:new Date(e.updatedAt)})}});function n(e){let t=e.get();return{id:e.id,name:t.name,icon:t.icon,kind:t.kind,promptTemplate:t.promptTemplate,tags:t.tags,applicationIds:t.applicationIds,websiteHosts:t.websiteHosts,organization:t.organization,organizationHandle:t.organizationHandle,createdAt:e.createdAt.toISOString(),updatedAt:t.updatedAt.toISOString()}}function r(e={}){let n={...U(e,{name:e.name??``,icon:e.icon,kind:e.kind??`custom`,promptTemplate:e.promptTemplate,tags:e.tags??[],applicationIds:e.applicationIds??[],websiteHosts:e.websiteHosts??[],organization:e.organization,organizationHandle:e.organizationHandle}),get iconDisplay(){let{icon:e}=n.get();return e&&h(e)?e:`microphone`},get nameDisplay(){let{name:e,isSaved:t}=n.get();return e.trim()||(t?`Unnamed Style`:`New Style`)},async delete(){if(n.get().kind===`builtin`)throw Error(`Cannot delete builtin transcription style`);await t.delete(n)},save:(e=!1)=>t.save(n,e)};return n}let i=S.map(e=>r({...e,tags:[...e.tags],applicationIds:[...e.applicationIds],websiteHosts:[...e.websiteHosts],createdAt:new Date(e.createdAt),updatedAt:new Date(e.updatedAt),isSaved:!0})),a={create:r,async saveAndMove(e,t){let{organizationHandle:r,...i}=n(e);await u.ipc.backend.ai.moveTranscriptionStyle({transcriptionStyleId:e.id,organizationId:i.organization?.id,...t?{targetOrganizationHandle:t}:{},transcriptionStyle:i})},get transcriptionStyles(){return[...i,...t.getObjects((e,t)=>e.nameDisplay.localeCompare(t.nameDisplay))]},get builtinTranscriptionStyles(){return i},get isLoading(){return t.isLoading},get isLoaded(){return t.isLoaded},load(){return t.reload()},loadInitial(){return t.loadInitial()},async forDetection(n,r){try{await a.loadInitial()}catch(t){e.debug(`extension::raycast-ai`,`Failed to load custom transcription styles`,{error:t})}return[...t.getObjects((e,t)=>e.nameDisplay.localeCompare(t.nameDisplay)),...i].filter(e=>{let t=_({commandId:g.dynamicCommands.transcriptionStyle.id,instanceId:e.id});return r?.(t)??!0}).map(e=>{let{applicationIds:t,websiteHosts:r}=Q(e,n);return{id:e.id,applicationIds:t,websiteHosts:r}})},getById(e){return i.find(t=>t.id===e)||t.getById(e)}};return a}function Q(e,t){if(e.get().kind===`builtin`){let n=t?.[e.id];if(n)return{applicationIds:n.applicationIds,websiteHosts:n.websiteHosts}}return{applicationIds:e.get().applicationIds,websiteHosts:e.get().websiteHosts}}function $(e){return{...e,tags:e.tags??[],applicationIds:e.applicationIds??[],websiteHosts:e.websiteHosts??[],organization:e.organization,organizationHandle:e.organizationHandle,createdAt:new Date(e.createdAt),updatedAt:new Date(e.updatedAt),isSaved:!0}}function le(e){return u.aiCatalog.transcriptionStyles.create($(e))}function ue(){let e,t,r,i,a,o=n(`aiModelAccess`,s());function s(e){let t=u.authStore.peek(),n={...ie,...a?.(),...e},r=ee({hasAccessToken:!!t.accessToken,user:t.user,aiByokApiKeys:n.aiByokApiKeys});return{...r,byokProviders:r.byokProviders}}u.authStore.subscribe(()=>o.set(s())),u.ipcNotification.settings.subscribeInternalExtensionSettingsUpdated(({extensionId:e,settings:t})=>{e===`e:r:ai`&&o.set(s(t.meta))});let c={get models(){if(!e){let t=ce(u.queryClient);e=t,u.ipcNotification.ai.subscribeModelsUpdated(e=>{u.queryClient.setQueryData([b],e),t.fetch({force:!0}).catch(()=>void 0)}),u.ipcNotification.auth.subscribeAccessTokenChanged(()=>{u.queryClient.invalidateQueries({queryKey:[b]}).then(()=>t.fetch({force:!0})).catch(()=>void 0)})}return e},get modes(){if(!t){let e=X();t=e,u.ipcNotification.ai.subscribeModesUpdated(()=>void e.load().catch(()=>void 0))}return t},get commands(){if(!r){let e=K();r=e,u.ipcNotification.ai.subscribeCommandsUpdated(()=>{e.load().catch(()=>void 0),u.queryClient.invalidateQueries({queryKey:C})})}return r},get transcriptionStyles(){if(!i){let e=Z();i=e,u.ipcNotification.ai.subscribeTranscriptionStylesUpdated(()=>{e.load().catch(()=>void 0),u.queryClient.invalidateQueries({queryKey:te}),u.queryClient.invalidateQueries({queryKey:x})})}return i},getModelAccessState:o.get,setAiExtensionPreferencesReader(e){a=e,o.set(s())},async prepareCatalogSurface(){await Promise.allSettled([c.models.dataAsPromise,c.modes.loadInitial(),c.commands.loadInitial(),c.transcriptionStyles.loadInitial()])}};return c}function de(e){e.registerLazyService(`aiCatalog`,ue)}export{C as a,H as i,Q as n,le as r,de as t};
//# sourceMappingURL=register-ai-catalog-service-DgP6ltJJ.js.map
//# debugId=f9885dba-9a86-553c-a5b3-04a89ad7e514
