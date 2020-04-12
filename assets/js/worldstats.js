var getJSON = function(url, callback) {

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    
    xhr.onload = function() {
    
        var status = xhr.status;
        
        if (status == 200) {
            callback(null, xhr.response);
        } else {
            callback(status);
        }
    };
    
    xhr.send();
};

getJSON('https://api.covid19india.org/data.json',  function(err, data) {
    
    if (err != null) {
        console.error(err);
    } else {
        document.getElementById('indActive').innerHTML = data.statewise[0].active;
        document.getElementById('indRecovered').innerHTML = data.statewise[0].recovered;
        document.getElementById('indDead').innerHTML = data.statewise[0].deaths;
        document.getElementById('indTotal').innerHTML = data.statewise[0].confirmed
    }
});
getJSON ('https://coronavirus-19-api.herokuapp.com/all', function(err, data) {
    
    if (err != null) {
        console.error(err);
    } else {
        //console.log(data['cases']);
        document.getElementById('wTotal').innerHTML = data['cases'];
        document.getElementById('wDead').innerHTML = data['deaths'];
        document.getElementById('wRecovered').innerHTML = data['recovered'];
    }
});
function openTab(evt, tabName) {
    var i, x, tablinks;
    x = document.getElementsByClassName("content-tab");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab");
    for (i = 0; i < x.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" is-active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " is-active";
  }