const fetch = require("node-fetch");
const { LIVE_URL,TELEGRAM_URL } = process.env;

exports.handler = async (event,context)=>{
    const body = JSON.parse(event.body)
    const {chat, text} = body.message;
    if(text==="/start"){
        fetch(TELEGRAM_URL+`sendMessage?chat_id=${chat.id}&message=${`Use the following commands:\n/live: Get Live Statistics`}`)
    }
    if(text==="/live") {
        fetch(LIVE_URL+"?v="+Math.floor(Math.random()*10**10).toString()).then(r=>r.json()).then(data=>{
                fetch(TELEGRAM_URL+`sendMessage?chat_id=${chat.id}&message=${JSON.stringify(data)}`)
        })
    }
    
}