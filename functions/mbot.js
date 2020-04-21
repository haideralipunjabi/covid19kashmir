const fetch = require("node-fetch");
const stringSimilarity = require("string-similarity")
const Utils = require("./utils")
const { URL_GMC } = process.env;
const LIVE_URL  ="https://gist.githubusercontent.com/haideralipunjabi/3743624e604ed3a81a40ca2ec44d7c9c/raw/"
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
      let speciality = event.queryStringParameters.speciality;
      if(!speciality){
          return {
              statusCode: 200,
              body: JSON.stringify({
                  "messages":[
                      {"text": "Couldn't find a doctor!"}
                  ]
              })
          }
      }
      return fetch(URL_GMC).then(response=>response.text()).then(values=>{
        data = Utils.ArraysToDict(Utils.CSVToArray(values))
        date = new Date;
        dateToday = `${date.getDate()}/${(date.getMonth()+1).toString().padStart(2,"0")}/${date.getFullYear()}`
        data = data.filter(item=>item["Date"]===dateToday)
        let specialities = data.map(item=>item["Speciality"].toLowerCase())
        if(specialities.includes(speciality.toLowerCase())){
            doctors = data.filter(item=>item["Speciality"].toLowerCase()===speciality.toLowerCase())
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
                                "subtitle": `${doctor.Speciality} (Source: GMC On-Call Duty Roster)`,
                                "buttons":[
                                    {
                                      "type":"phone_number",
                                      "phone_number":"+91"+doctor["Phone No"],
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
            let matches = stringSimilarity.findBestMatch(speciality.toLowerCase(),specialities)
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
                            "url": `https://covidkashmir.org/.netlify/functions/mbot?doctors=1&speciality=${matches.bestMatch.target}`,
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