var MarketDataHandler = require(process.cwd() + '/app/controllers/marketData.js');

module.exports = function (app) {
    
    // lookup
    app.get('/lookup', MarketDataHandler.lookup);
    
    // homepage
    app.get('/', function(req, res){
        res.render('index', {
            stocks: global.stocks
        });
    });

    // chart init
    app.get('/stocks', MarketDataHandler.getChartData);
};