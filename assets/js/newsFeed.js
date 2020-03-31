
$.getJSON("https://spreadsheets.google.com/feeds/list/1nF0HoIVWQpXxtE1p46A0ipy1dZC4gf84MB35atNWLAw/od6/public/values?alt=json", function (data) {
    
    var sheetData = data.feed.entry;
    var i;
    var sheetLength = sheetData.length;
    var displayCount = 3;

    function IndexnewsFeedContainer(displayCount){
        
        for (i = 0; i < displayCount; i++) {
            var date = data.feed.entry[i]['gsx$date']['$t'];
            var sourceType = data.feed.entry[i]['gsx$sourcetype']['$t'];
            var sourceName = data.feed.entry[i]['gsx$sourcename']['$t'];
            var sourceLink = data.feed.entry[i]['gsx$sourcelink']['$t'];
            var content  =  data.feed.entry[i]['gsx$news']['$t'];          
            
            $(".IndexnewsFeedContainer").append(
               "<article class='message is-dark'>"+
               "<div class='message-body'>"+
                "<p> "+content+" </p>"+
                "<span><strong> Source: </strong>"+
                "<span class='has-text-danger'>"+sourceName+"</span>"+ " "+
                "<a href='"+sourceLink+"'>Link</a></span><br/>"+
                "<span class='has-text-primary'>"+date+"</span>"+
                "</div></article>"
                      
            );
          }
    }
    function AllnewsFeedContainer(){
        
        for (i = 0; i < sheetData.length; i++) {
            var date = data.feed.entry[i]['gsx$date']['$t'];
            var sourceType = data.feed.entry[i]['gsx$sourcetype']['$t'];
            var sourceName = data.feed.entry[i]['gsx$sourcename']['$t'];
            var sourceLink = data.feed.entry[i]['gsx$sourcelink']['$t'];
            var content  =  data.feed.entry[i]['gsx$news']['$t'];          
            $(".AllnewsFeedContainer").append(
                "<article class='message is-dark'>"+
                "<div class='message-body'>"+
                 "<p> "+content+" </p>"+
                 "<span><strong> Source: </strong>"+
                 "<span class='has-text-danger'>"+sourceName+"</span>"+ " "+
                 "<a href='"+sourceLink+"'>Link</a></span><br/>"+
                 "<span class='has-text-primary'>"+date+"</span>"+
                 "</div></article>"
             );
          }
    }
    IndexnewsFeedContainer(displayCount);
    AllnewsFeedContainer();

  });
  