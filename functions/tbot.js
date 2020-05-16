const fetch = require("node-fetch");
const { LIVE_URL,TELEGRAM_URL } = process.env;

exports.handler = async (event,context)=>{
    const body = JSON.parse(event.body)
    const {chat, text} = body.message;
    if(text==="/start"){
        fetch(TELEGRAM_URL+`sendMessage?chat_id=${chat.id}&text=${`Use the following commands:\n/live: Get Live Statistics`}`).then(r=>r.json()).then(d=>console.log("start",d))
    }
    if(text==="/live") {
        fetch(LIVE_URL+"?v="+Math.floor(Math.random()*10**10).toString()).then(r=>r.json()).then(data=>{
            message = `Total: ${data.Total} (New: ${data.Total - data.TotalYesterday})\nActive: ${data.Active} (New : ${(data.Active - data.ActiveYesterday) + (data.Deceased - data.DeceasedYesterday) + (data.Recovered - data.RecoveredYesterday)})\nRecovered: ${data.Recovered} (New: ${data.Recovered - data.RecoveredYesterday})\nDeceased: ${data.Deceased} (New: ${data.Deceased - data.DeceasedYesterday})\nUpdated: ${data.Updated}\nSource:covidkashmir.org`
            fetch(TELEGRAM_URL+`sendMessage?chat_id=${chat.id}&text=${message}`).then(r=>r.json()).then(d=>console.log("live",d))
        })
    }
    
}