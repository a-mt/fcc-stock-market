'use strict';
var http = require('http'),
    fs   = require('fs');

var MarketDataHandler = function(){
    
    // Get symbol from label
    this.lookup = function(req, res) {
        var input = req.query.input;

        if(input) {
            http.get("http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input=" + input, function(subres) {
                
                if(subres.statusCode != 200) {
                    res.status(subres.statusCode).send(subres.statusMessage);
                } else {
                    var body = '';
                    subres.on('data', function(chunk) {
                        body += chunk.toString().trim();
                    });
                    subres.on('end', function() {
                        res.send(body);
                    });
                }

            }).on('error', function(e) {
                res.status(500).send(e.message);
            });
        } else {
            res.json([]);
        }
    };
    
    // Check if given symbol exists before adding
    this.add = function(value, res) {

        // Check that the symbol exists
        if(!value) {
            return;
        }
        value = value.toUpperCase();
        http.get("http://dev.markitondemand.com/MODApis/Api/v2/Quote/json?symbol=" + value, function(subres) {

            if(subres.statusCode == 200) {
                var body = '';
                subres.on('data', function(chunk) {
                    body += chunk.toString().trim();
                });
                subres.on('end', function() {
                    var data = JSON.parse(body);

                    if(data.Message) {
                        res.socket.emit('error', data.Message); // {"Message":"No symbol matches found for =fb. Try another symbol such as MSFT or AAPL, or use the Lookup API."}
                    } else {
                        var item = {
                            symbol: data.Symbol,
                            label: data.Name
                        };
                        if(global.stocks[data.Symbol]) {
                            res.socket.emit('errorMsg', 'The symbol "' + data.Symbol + '" is already in the list');
                        } else {
                            
                            // Add stock to the list
                            global.stocks[data.Symbol] = item;
                            fs.writeFile(process.env.DB, JSON.stringify(global.stocks));
                            res.io.emit('add', item);

                            // Get data
                            var q = {};
                            q[data.Symbol] = item;

                            queryChartData(q, function(data){
                                if(data != '{}') {
                                    res.io.emit('addline', data);
                                }
                            });
                        }
                    }
                });
            }
        });
    };

    // Remove the given symbol from chart
    this.remove = function(value, res) {
        if(!value) {
            return;
        }
        if(global.stocks[value]) {
            delete global.stocks[value];
            fs.writeFile(process.env.DB, JSON.stringify(global.stocks));
            res.io.emit('remove', value);
        }
    };
    
    // Get datas for the graph
    this.getChartData = function(req, res) {
        queryChartData(global.stocks, function(data) {
            res.json(data);
        });
    };
};

// Get data for the given stocks
function queryChartData(stocks, cb) {

    var elems = [];
    for(let symbol in stocks) {
        elems.push({
           Symbol: symbol,
           Type:   "price",
           Params: ["c"]
        });
    }
    if(!elems) {
        cb("{}");
        return;
    }

    var json = JSON.stringify({  
        Normalized: false,
        NumberOfDays: 366, // 1 year + today
        DataPeriod: "Day",
        Elements: elems
    });

    http.get("http://dev.markitondemand.com/MODApis/Api/v2/InteractiveChart/json?parameters=" + json, function(subres) {
        var body = '';
        subres.on('data', function(chunk) {
            body += chunk.toString().trim();
        });
        subres.on('end', function() {
            cb(body);
        });
    });
}

module.exports = new MarketDataHandler();