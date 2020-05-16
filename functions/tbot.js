const fetch = require("node-fetch");
const { LIVE_URL, TELEGRAM_URL } = process.env;
const SAMPLE_URL = "https://covidkashmir.org/.netlify/functions/api?fields=samples"
const DISTRICT_URL = "http://covidkashmir.org/.netlify/functions/api?fields=districtMap"
function getLiveStatistics(chat){
    let rm = {
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
        let message = `<b>Total:</b> ${data.Total} <i>(New: ${data.Total - data.TotalYesterday})</i>\n<b>Active:</b> ${data.Active} <i>(New : ${(data.Active - data.ActiveYesterday) + (data.Deceased - data.DeceasedYesterday) + (data.Recovered - data.RecoveredYesterday)})</i>\n<b>Recovered:</b> ${data.Recovered} <i>(New: ${data.Recovered - data.RecoveredYesterday})</i>\n<b>Deceased:</b> ${data.Deceased} <i>(New: ${data.Deceased - data.DeceasedYesterday})</i>\n<b>Updated:</b> ${data.Updated}`
        return fetch(TELEGRAM_URL+`sendMessage?chat_id=${chat.id}&text=${message}&parse_mode=HTML&reply_markup=${JSON.stringify(rm)}`).then(r=>r.json()).then(d=>{
            return {
                statusCode: 200,
                body: JSON.stringify(d)      
              }
        })
    })
}
function getSampleStatistics(chat){
    let rm = {
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
    return fetch(SAMPLE_URL).then(r=>r.json()).then(d=>{
        let data = d["samples"]
        let message = `<b>Total Samples Collected:</b> ${data.stats.total}\n<b>New Samples Collected:</b> ${data.stats.new}\n<b>Positive Percentage:</b> ${data.stats.posper.toPrecision(3)+"%"}\n<b>Negative Percentage:</b> ${data.stats.negper.toPrecision(3)+"%"}\n<b>Date:</b> ${data.date}`
        return fetch(TELEGRAM_URL+`sendMessage?chat_id=${chat.id}&text=${message}&parse_mode=HTML&reply_markup=${JSON.stringify(rm)}`).then(r=>r.json()).then(d=>{
            return {
                statusCode: 200,
                body: JSON.stringify(d)      
              }
        })
    })
}
function getDistrictData(chat,cDistrict){
    return fetch(DISTRICT_URL).then(r=>r.json()).then(d=>{
        let distrctData = d["districtMap"]
        if(cDistrict===""){
            let districtObjects = Object.keys(distrctData).map(district=>{
                return {
                    "text":district,
                    "callback_data": JSON.stringify({
                        "command": "districts",
                        "district": district
                    })
                }
            })
            let districtMarkup = []
            for(let i =0; i<Math.ceil(districtObjects.length/3);i++){
                districtMarkup[i]=new Array()
            }
            districtObjects.forEach((dis,idx)=>{
                districtMarkup[idx%(Math.ceil(districtObjects.length/3))].push(dis)
            })
            let reply_markup = {
                "inline_keyboard": districtMarkup,
                "resize_keyboard":true,
                "one_time_keyboard":true
            }
            let message = "Choose a District"
            return fetch(TELEGRAM_URL+`sendMessage?chat_id=${chat.id}&text=${message}&reply_markup=${JSON.stringify(reply_markup)}`).then(r=>r.json()).then(da=>{
                return {
                    statusCode: 200,
                    body: JSON.stringify(da)      
                  }
            })
        }
        else {
            let rm = {
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
            let dData = distrctData[cDistrict]
            let message = `<b>${cDistrict}</b>\n<b>Total:</b> ${dData.Total} <i>(New: ${dData.newTotal})</i>\n<b>Active:</b> ${dData.Active} <i>(New: ${dData.newActive})</i>\n<b>Recovered:</b> ${dData.Recovered} <i>(New: ${dData.newRecovered})</i>\n<b>Deceased:</b> ${dData.Deceased} <i>(New: ${dData.newDeceased})</i>`
            return fetch(TELEGRAM_URL+`sendMessage?chat_id=${chat.id}&text=${message}&parse_mode=HTML&reply_markup=${JSON.stringify(rm)}`).then(r=>r.json()).then(db=>{
                return {
                    statusCode: 200,
                    body: JSON.stringify(db)      
                    }
            })
            
        }
    })
}

exports.handler = async (event,context)=>{
    const body = JSON.parse(event.body)
    if(Object.keys(body).includes("callback_query")){
        const { data, from } = body.callback_query
        cData = JSON.parse(data)
        if(cData.command==="live"){
            return getLiveStatistics(from);
        }
        if(cData.command==="samples"){
            return getSampleStatistics(from)
        }
        if(cData.command==="districts"){
            return getDistrictData(from,cData.district)
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
                            "callback_data": JSON.stringify({
                                "command":"live"
                            })
                        }
                    ],
                    [
                        {
                            "text":"Sample Statistics",
                            "callback_data": JSON.stringify({
                                "command":"samples"
                            })
                        }
                    ],
                    [
                        {
                            "text":"District Statistics",
                            "callback_data": JSON.stringify({
                                "command":"districts",
                                "district":""
                            })
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
        else if(text==="/live") {
            return getLiveStatistics(chat);

        }
        else if(text==="/samples"){
            return getSampleStatistics(chat);
        }
        else if(text==="/districts"){
            return getDistrictData(chat,"");
        }
        else {
            return {
                statusCode: 404,
                body: "error"      
              }
        }
    }
}