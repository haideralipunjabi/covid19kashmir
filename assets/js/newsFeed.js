function getNewsItem(item){
    let date = item['gsx$date']['$t'];
    let sourceType = item['gsx$sourcetype']['$t'];
    let sourceName = item['gsx$sourcename']['$t'];
    let sourceLink = item['gsx$sourcelink']['$t'];
    let content  =  item['gsx$news']['$t']; 
    return `<article class='message is-dark'>
    <div class='message-body'>
     <p>${content}</p>
     <span><strong> Source: </strong>
     <span class='has-text-danger'>${sourceName}</span>
     <a href="${sourceLink}">Link</a></span><br/>
     <span class='has-text-primary'>${date}</span>
     </div></article>`;
}

function loadNews(news){
    $("#news-container").html("")
    let displayCount = window.location.pathname.includes("allNews") ? news.length : 3;
    for(let item of news){
        if($("#news-container").children().length === displayCount) break;
        $("#news-container").append(getNewsItem(item))
    }
}
fetch("https://covidkashmir.org/api/news/").then((response) => {
    return response.json()
}).then((data) => {
    loadNews(data.feed.entry)
});
  