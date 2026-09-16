const CATEGORIES={
  "All":["Sweet & Romantic","Appreciation","Thinking of You","Encouragement","Make Her Smile","Thank Her","Goodnight","Flirty"],
  "Sweet & Romantic":[
    "I hope you know how deeply loved you are. ❤️",
    "I'd choose you all over again.",
    "You make ordinary days feel special just by being in them.",
    "Just a reminder: you're my favorite person.",
    "I still get happy knowing I get to call you mine."
  ],
  "Appreciation":[
    "I notice everything you do, and I appreciate you more than I say.",
    "Thank you for being the amazing woman you are.",
    "You make our home and our life better in so many little ways.",
    "I don't ever want you to wonder if I appreciate you. I do. So much.",
    "I'm lucky to have you beside me."
  ],
  "Thinking of You":[
    "Just thinking about you and smiling.",
    "You popped into my head, so I had to tell you I love you.",
    "Hope your day is going okay. I'm thinking about you.",
    "Wish I could give you a hug right now.",
    "Random reminder that you're on my mind."
  ],
  "Encouragement":[
    "You've got this. I believe in you completely.",
    "Whatever today throws at you, remember I'm in your corner.",
    "You're stronger than you realize, and I'm proud of you.",
    "Take a breath. You're doing better than you think.",
    "I'm always cheering for you."
  ],
  "Make Her Smile":[
    "Official announcement: you're still my favorite human.",
    "I love you more than snacks. And you know that's serious.",
    "If loving you were a job, I'd happily work overtime.",
    "You are ridiculously cute. I don't make the rules.",
    "Just checking in to remind you that you're stuck with me. ❤️"
  ],
  "Thank Her":[
    "Thank you for loving me the way you do.",
    "Thank you for all the little things I sometimes forget to say thank you for.",
    "Thank you for being patient, kind, and you.",
    "I don't say it enough: thank you for being in my life.",
    "Thank you for making life feel like home."
  ],
  "Goodnight":[
    "Goodnight, beautiful. I hope you sleep knowing how loved you are.",
    "Sleep well, my love. Tomorrow is another day together.",
    "Goodnight ❤️ I'm grateful I get to love you.",
    "Rest up, beautiful. I'll be thinking about you.",
    "Sweet dreams to my favorite person."
  ],
  "Flirty":[
    "Just so we're clear, I still think you're incredibly hot.",
    "I have a crush on you. It may be permanent.",
    "You looked especially good today. Just saying.",
    "I miss your face… and maybe a few other things. 😉",
    "Still very much into you. Carry on."
  ]
};

const DEFAULT={
  name:"",phone:"",remindersEnabled:true,reminderCount:3,
  times:["09:00","13:00","19:30"],avoidRepeats:true,customMessages:"",
  sent:[],used:[],lastDate:""
};
let state=load();
let category="Sweet & Romantic";
let currentMessage="";

function load(){try{return {...DEFAULT,...JSON.parse(localStorage.getItem("dearlyState")||"{}")}}catch{return {...DEFAULT}}}
function save(){localStorage.setItem("dearlyState",JSON.stringify(state))}
function $(id){return document.getElementById(id)}
function toast(t){const el=$("toast");el.textContent=t;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),1800)}
function formatTime(t){let [h,m]=t.split(":").map(Number);const ap=h>=12?"PM":"AM";h=h%12||12;return `${h}:${String(m).padStart(2,"0")} ${ap}`}
function allMessages(){
  const custom=(state.customMessages||"").split(/\n/).map(x=>x.trim()).filter(Boolean);
  return Object.values(CATEGORIES).flat().concat(custom);
}
function pickMessage(){
  let pool=category==="All"?allMessages():(CATEGORIES[category]||CATEGORIES["Sweet & Romantic"]).slice();
  const recent=state.used||[];
  if(state.avoidRepeats){
    const fresh=pool.filter(x=>!recent.includes(x));
    if(fresh.length)pool=fresh;
  }
  currentMessage=pool[Math.floor(Math.random()*pool.length)]||"I love you. ❤️";
  if(!state.used)state.used=[];
  state.used.push(currentMessage);
  state.used=state.used.slice(-20);save();renderMessage();
}
function renderMessage(){
  $("message").textContent=currentMessage;
  $("categoryLabel").textContent=category;
}
function renderChips(){
  $("categoryChips").innerHTML=["All",...CATEGORIES["All"]].map(c=>`<button class="chip ${c===category?"active":""}" data-cat="${c}">${c}</button>`).join("");
  document.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{category=b.dataset.cat;renderChips();pickMessage()});
}
function renderStats(){
  const today=new Date().toISOString().slice(0,10);
  const sentToday=(state.sent||[]).filter(x=>x.date===today).length;
  $("sentToday").textContent=sentToday;$("totalSent").textContent=(state.sent||[]).length;
  const dates=[...new Set((state.sent||[]).map(x=>x.date))].sort().reverse();
  let streak=0,d=new Date();
  for(const date of dates){
    const ds=d.toISOString().slice(0,10);
    if(date===ds){streak++;d.setDate(d.getDate()-1)} else if(date<ds)break;
  }
  $("streak").textContent=streak;
}
function renderReminderSummary(){
  const n=Number(state.reminderCount)||1;
  $("reminderSummary").textContent=`${n} reminder${n===1?"":"s"} a day`;
  $("reminderTimes").textContent=(state.times||[]).slice(0,n).map(formatTime).join(" · ");
}
function render(){
  const has=!!state.name&&!!state.phone;
  $("setupView").classList.toggle("hidden",has);
  $("homeView").classList.toggle("hidden",!has);
  $("settingsView").classList.add("hidden");
  $("recipientName").textContent=state.name||"her";
  $("avatar").textContent=(state.name||"♡").charAt(0).toUpperCase();
  renderChips();renderStats();renderReminderSummary();
  if(!currentMessage)pickMessage();
}
function openSettings(){
  $("homeView").classList.add("hidden");$("setupView").classList.add("hidden");$("settingsView").classList.remove("hidden");
  $("settingsName").value=state.name;$("settingsPhone").value=state.phone;
  $("remindersEnabled").checked=state.remindersEnabled;$("avoidRepeats").checked=state.avoidRepeats;
  $("reminderCount").innerHTML=Array.from({length:10},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join("");
  $("reminderCount").value=state.reminderCount;
  renderTimeFields();
  $("customMessages").value=state.customMessages||"";
}
function renderTimeFields(){
  const n=Number($("reminderCount").value||state.reminderCount||3);
  state.times=state.times||[];
  while(state.times.length<n)state.times.push("09:00");
  $("timeFields").innerHTML=Array.from({length:n},(_,i)=>`<label>Reminder ${i+1}<input class="time-input" data-i="${i}" type="time" value="${state.times[i]||"09:00"}"></label>`).join("");
}
function saveSetup(){
  const name=$("setupName").value.trim(),phone=$("setupPhone").value.trim();
  if(!name||!phone){toast("Please enter her name and phone number.");return}
  state.name=name;state.phone=phone;save();render();toast("You're all set ❤️");
}
function saveSettings(){
  state.name=$("settingsName").value.trim();state.phone=$("settingsPhone").value.trim();
  state.remindersEnabled=$("remindersEnabled").checked;state.reminderCount=Number($("reminderCount").value);
  state.times=[...document.querySelectorAll(".time-input")].map(x=>x.value||"09:00");
  state.avoidRepeats=$("avoidRepeats").checked;state.customMessages=$("customMessages").value;
  save();render();toast("Settings saved.");
}
function textHer(){
  if(!state.phone){toast("Add her phone number in Settings.");return}
  const body=encodeURIComponent(currentMessage);
  window.location.href=`sms:${state.phone}?&body=${body}`;
  const today=new Date().toISOString().slice(0,10);
  state.sent.push({date:today,message:currentMessage,at:new Date().toISOString()});save();renderStats();
}
async function copyMessage(){
  try{await navigator.clipboard.writeText(currentMessage);toast("Message copied.");}
  catch{toast("Copy isn't available here.");}
}
async function requestNotifications(){
  if(!("Notification" in window)){toast("Notifications aren't supported here.");return}
  const p=await Notification.requestPermission();toast(p==="granted"?"Notifications enabled ❤️":"Notifications not enabled.");
}
function checkReminder(){
  if(!state.remindersEnabled||Notification.permission!=="granted")return;
  const now=new Date(),hm=now.toTimeString().slice(0,5),key=now.toISOString().slice(0,10)+"-"+hm;
  if((state.times||[]).slice(0,state.reminderCount).includes(hm)&&state.lastReminder!==key){
    state.lastReminder=key;save();
    new Notification(`A little love for ${state.name}`,{body:"Send her something sweet. ❤️"});
  }
}

$("saveSetup").onclick=saveSetup;
$("settingsBtn").onclick=openSettings;$("backBtn").onclick=render;$("editRecipient").onclick=openSettings;
$("newMessage").onclick=pickMessage;$("textHer").onclick=textHer;$("copyMessage").onclick=copyMessage;
$("saveSettings").onclick=saveSettings;$("requestNotifications").onclick=requestNotifications;$("notificationBtn").onclick=requestNotifications;
$("reminderCount").onchange=renderTimeFields;
$("setupName").onkeydown=e=>{if(e.key==="Enter")$("setupPhone").focus()};
setInterval(checkReminder,30000);
if("serviceWorker" in navigator)navigator.serviceWorker.register("service-worker.js").catch(()=>{});
render();
