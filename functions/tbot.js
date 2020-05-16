const fetch = require("node-fetch");
const { LIVE_URL,TELEGRAM_URL } = process.env;

function getLiveStatistics(chat){
    rm = {
        "inline_keyboard":[
            [
                {
                    "text":"Open Website",
                    "url": "https://covidkashmir.org"
                }
            ]
        ],
        "resize_keyboard":true,
        "one_time_keyboard":true
    }
    return fetch(LIVE_URL+"?v="+Math.floor(Math.random()*10**10).toString()).then(r=>r.json()).then(data=>{
        message = `Total: ${data.Total} (New: ${data.Total - data.TotalYesterday})\nActive: ${data.Active} (New : ${(data.Active - data.ActiveYesterday) + (data.Deceased - data.DeceasedYesterday) + (data.Recovered - data.RecoveredYesterday)})\nRecovered: ${data.Recovered} (New: ${data.Recovered - data.RecoveredYesterday})\nDeceased: ${data.Deceased} (New: ${data.Deceased - data.DeceasedYesterday})\nUpdated: ${data.Updated}`
        return fetch(TELEGRAM_URL+`sendMessage?chat_id=${chat.id}&text=${message}&reply_markup=${JSON.stringify(rm)}`).then(r=>r.json()).then(d=>{
            return {
                statusCode: 200,
                body: JSON.stringify(d)      
              }
        })
    })
}
exports.handler = async (event,context)=>{
    const body = JSON.parse(event.body)
    console.log(body)
    if(Object.keys(body).includes("callback_query")){
        const { data, from } = body.callback_query

        if(data==="/live"){
            return getLiveStatistics(from);
        }
    }
    else {
        const {chat, text} = body.message;
        if(text==="/start"){
            rm = {
                "inline_keyboard":[
                    [
                        {
                            "text":"Live Statistics",
                            "callback_data": "/live"
                        }
                    ]
                ],
                "resize_keyboard":true,
                "one_time_keyboard":true
            }
            return fetch(TELEGRAM_URL+`sendMessage?chat_id=${chat.id}&text=${`Hi, what can I do for you?`}&reply_markup=${JSON.stringify(rm)}`).then(r=>r.json()).then(d=>{
                return {
                    statusCode: 200,
                    body: JSON.stringify(d)      
                  }
            })
        }
        if(text==="/live") {
            return getLiveStatistics(chat);
        }
        else {
            return {
                statusCode: 404,
                body: "error"      
              }
        }
    }
}