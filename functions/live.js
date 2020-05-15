const fetch = require("node-fetch")

exports.handler = async (event,context)=>{
    return fetch(LIVE_URL+"?v="+Math.floor(Math.random()*10**10).toString()).then(r=>r.json()).then(data=>{
        return {
            statusCode: 200,
            headers:{
                'Access-Control-Allow-Origin': '*',
                'access-control-allow-origin': '*',
                'Access-Control-Allow-Headers':'*',
            },
            body:JSON.stringify(data)
          }
    })
}
