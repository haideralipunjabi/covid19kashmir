const fetch = require("node-fetch")
const LIVE_URL = "https://gist.githubusercontent.com/haideralipunjabi/3743624e604ed3a81a40ca2ec44d7c9c/raw/"
exports.handler = async (event,context)=>{
    return fetch(LIVE_URL+"?v="+Math.floor(Math.random()*10**10).toString()).then(r=>r.json()).then(data=>{
        return {
            statusCode: 200,
            headers:{
                'Access-Control-Allow-Origin': '*',
            },
            body:JSON.stringify(data)
          }
    })
}