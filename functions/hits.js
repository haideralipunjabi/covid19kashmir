const fetch = require("node-fetch");
const Utils = require("./utils")
// const { URL_ANALYTICS } = process.env;
URL_ANALYTICS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQDDYzV5ur3z4rzAkcFH9BMqM60wwniEIblLyk_ZY3R3Ye1HkLUbDIs803C-jhfXbqAwJW7f1P7Oq79/pub?gid=292216360&single=true&output=csv"
exports.handler = async (event, context) => {

    return fetch(URL_ANALYTICS).then(response=>response.text()).then(values=>{
        let rawData = Utils.ArraysToDict(Utils.CSVToArray(values))
        let totalViews  = Object.values(rawData[10])[1]
        let urlPageViewsMap = {}
        for(let i =14; i < rawData.length;i++){
            let key = Object.values(rawData[i])[0]
            let value = parseInt(Object.values(rawData[i])[1])
            if(key.includes("?")){
                key = key.substring(0,key.indexOf("?"))
            }
            key = key.replace(".html","").replace("index","")
            if(Object.keys(urlPageViewsMap).includes(key)){
                urlPageViewsMap[key] += value
            }
            else{
                urlPageViewsMap[key] = value
            }
        }
      return {
        statusCode: 200,
        body:JSON.stringify({
            "total":totalViews,
            "pageMap":urlPageViewsMap
        })
      }
    }).catch(error => ({
        statusCode: 422,
        body: String(error)
      }));
  
  
  
  };