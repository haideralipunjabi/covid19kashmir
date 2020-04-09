exports.CSVToArray= function(strData, strDelimiter)  {
    strDelimiter = (strDelimiter || ",");
    var objPattern = new RegExp(
        (
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
    );
    var arrData = [
        []
    ];
    var arrMatches = null;
    while (arrMatches = objPattern.exec(strData)) {
        var strMatchedDelimiter = arrMatches[1];
        if (
            strMatchedDelimiter.length &&
            strMatchedDelimiter !== strDelimiter
        ) {
            arrData.push([]);
        }
        var strMatchedValue;
        if (arrMatches[2]) {
            strMatchedValue = arrMatches[2].replace(
                new RegExp("\"\"", "g"),
                "\""
            );
        } else {
            strMatchedValue = arrMatches[3];
        }
        arrData[arrData.length - 1].push(strMatchedValue);
    }

    return (arrData);
}

exports.ArraysToDict = function(data) {
    let return_data = [];
    for (let i = 1; i < data.length; i++) {
        let item = {};
        for (let col in data[i]) {
            item[data[0][col]] = data[i][col]
        }
        return_data.push(item)
    }
    return return_data;
}

exports.filterDataByDistrict=function(data, district) {
    return data.filter(item => {
        return item["District"] === district
    })
}

exports.filterDataByStatus = function(data, status) {
    return data.filter(item => {
        return item["Status"] === status
    })
}

exports.filterDataByDate = function(data, date) {
    return data.filter(item => {
        return item["Date Announced"] === date
    })
}

exports.getUnique = function(data, key) {
    return data.map((item) => {
        return item[key]
    }).filter((value, index, self) => {
        return self.indexOf(value) === index
    });
}
exports.createUnknownDistrict = function(data) {
    return data.map(item => {
      if (item["District"] === "") item["District"] = "Unknown"
      return item;
    })
  }

exports.parseIntOpt = function(s){
    return s? parseInt(s):0
}