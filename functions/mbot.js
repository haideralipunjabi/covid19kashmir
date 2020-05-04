const fetch = require("node-fetch");
const stringSimilarity = require("string-similarity")
const Utils = require("./utils")
const { LIVE_URL, URL_DOCTORS } = process.env;

exports.handler = async (event, context) => {
  if(event.queryStringParameters.stats){
    return fetch(LIVE_URL+"?v="+Math.floor(Math.random()*10**10).toString()).then(r=>r.json()).then(data=>{
        let returnData = {
            "messages":[
                {"text": `Total: ${data.Total} (New: ${data.Total - data.TotalYesterday})`},
                {"text": `Active: ${data.Active} (New : ${(data.Active - data.ActiveYesterday) + (data.Deceased - data.DeceasedYesterday) + (data.Recovered - data.RecoveredYesterday)})`},
                {"text": `Recovered: ${data.Recovered} (New: ${data.Recovered - data.RecoveredYesterday})`},
                {"text": `Deceased: ${data.Deceased} (New: ${data.Deceased - data.DeceasedYesterday})`},
                {"text": `Updated: ${data.Updated}`}
            ]
        }
        return {
            statusCode: 200,
            body: JSON.stringify(returnData)      
          }
    })
  }
  if(event.queryStringParameters.doctors) {
      let keyword = event.queryStringParameters.keyword;
      if(!keyword){
          return {
              statusCode: 200,
              body: JSON.stringify({
                  "messages":[
                      {"text": "Couldn't find a doctor!"},
                      {
                        "attachment": {
                          "type": "template",
                          "payload": {
                            "template_type": "button",
                            "text": "You can also talk with our admin.",
                            "buttons": [
                              {
                                "type": "show_block",
                                "block_names": ["Live Chat"],
                                "title": "Live Chat with Admin"
                              }
                            ]
                          }
                        }
                      }
                  ],
              })
          }
      }
      return fetch(URL_DOCTORS).then(response=>response.text()).then(values=>{
        data = Utils.ArraysToDict(Utils.CSVToArray(values))
        dateToday = new Date().toLocaleString("en-GB", {timeZone: "Asia/Kolkata"}).split(",")[0]
        timeNow = new Date().toLocaleString("en-GB", {timeZone: "Asia/Kolkata"}).split(",")[1].trim().substr(0,5).replace(":","")
        dayToday = new Date().getDay();
        data = data.filter(item=>(item["Date"]===dateToday || item["Date"]===""))
        data = data.filter(item=>(item["Time"]==="" || 
                          (parseInt(timeNow) >= parseInt(item["Time"].split("-")[0]) && 
                            parseInt(timeNow) <= parseInt(item["Time"].split("-")[1]) )))
        data = data.filter(item=>(item["Days"]==="" || 
                          (dayToday >= parseInt(item["Days"].split("-")[0]) &&
                            dayToday <= parseInt(item["Days"].split("-")[1]) )))
        if(data.length === 0){
          return {
              statusCode: 200,
              body: JSON.stringify({
                  "messages":[
                      {"text": "Couldn't find a doctor!"},
                      {
                        "attachment": {
                          "type": "template",
                          "payload": {
                            "template_type": "button",
                            "text": "You can also talk with our admin.",
                            "buttons": [
                              {
                                "type": "show_block",
                                "block_names": ["Live Chat"],
                                "title": "Live Chat with Admin"
                              }
                            ]
                          }
                        }
                      }
                  ]
              })
          }
          
          }
        let keywords = data.flatMap(item=>item["Keywords"].split(",").map(k=>k.toLowerCase().trim()))
        console.log(keyword)
        if(keywords.includes(keyword.toLowerCase())){
            doctors = data.filter(item=>item["Keywords"].split(",").map(k=>k.toLowerCase().trim()).includes(keyword.toLowerCase()))
            doctorsdata = {
                "messages":[
                  {
                    "attachment":{
                      "type":"template",
                      "payload":{
                        "template_type":"generic",
                        "elements": doctors.map(doctor=>{
                            return {
                                "title": doctor.Name,
                                "subtitle": `${doctor.Field} (Source: ${doctor.Source})`,
                                "buttons":[
                                    {
                                      "type":"phone_number",
                                      "phone_number":"+91"+doctor["Contact"],
                                      "title":"Call Doctor"
                                    }
                                  ]
                            }
                        })
                      }
                    }
                  }
                ]
              }
              return {
                  statusCode: 200,
                  body: JSON.stringify(doctorsdata)
              }
        }
        else {
            let matches = stringSimilarity.findBestMatch(keyword.toLowerCase(),keywords)
            let returnData = {
                "messages": [
                  {
                    "attachment": {
                      "type": "template",
                      "payload": {
                        "template_type": "button",
                        "text": `Did you mean ${Utils.titleCase(matches.bestMatch.target)}?`,
                        "buttons": [
                          {
                            "type": "json_plugin_url",
                            "url": `https://covidkashmir.org/.netlify/functions/mbot?doctors=1&keyword=${matches.bestMatch.target}`,
                            "title": "Yes"
                          },
                          {
                            "url": "https://covidkashmir.org/.netlify/functions/mbot?doctors=1",
                            "type":"json_plugin_url",
                            "title":"No"
                          }
                        ]
                      }
                    }
                  }
                ]
              }
              return {
                  statusCode: 200,
                  body: JSON.stringify(returnData)
              }
        }
      }).catch(error => ({
          statusCode: 422,
          body: String(error)
        }));
      
  }
  



};
