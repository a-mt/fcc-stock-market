var Chart = {
    chart: false,

    // Get full data of the chart
    init: function(){
        $.ajax({
            beforeSend:function(){
                $("#container").text("Loading chart...");
            },
            url: "/stocks",
            success: function(data){
                data = JSON.parse(data);
                if(!data.Elements) {
                    $('#container').text('Nothing to display. Add stocks below');
                    return;
                }
                var series = Chart.formatData(data);
                Chart.draw(series);
            }
        });
    },

    // Format data retrieved from markitondemand to HighChart format
    formatData: function(data) {

        // Create a line for each stock
        var series  = [];
        var nbElems = data.Elements.length;

        for(let i=0; i<nbElems; i++) {
            var item = data.Elements[i];
            series.push({
                name: item.Symbol,
                data: []
            });
        }

        // Retrieve the data of each
        for(let i=0; i<data.Dates.length; i++) {
            var date = (new Date(data.Dates[i])).getTime();

            for(let j=0; j<nbElems; j++) {
                series[j].data.push([
                    date,
                    data.Elements[j].DataSeries.close.values[i]
                ]);
            }
        }
        return series;
    },

    // Draw the retrieved datas
    draw: function(series) {

        // Draw the chart
        Chart.chart = Highcharts.stockChart('container', {
            rangeSelector: {
                selected: 5 // all
            },
            title: {
                text: 'Stocks'
            },
            navigator: {
                enabled: false
            },
            series: series
        });

        // Update colors of list divs
        for(var i=0; i<Chart.chart.series.length; i++) {
            var item = Chart.chart.series[i];
            $('#list .item[data-symbol="' + item.name + '"]').css('border-color', item.color);
        }
    },

    // Add a new line to the chart
    addLine: function(data) {
        var series = Chart.formatData(data);

        if(!Chart.chart) {
            Chart.draw(series);
            return;
        }

        // Add line
        for(let i=0; i<series.length; i++) {
            var item = Chart.chart.addSeries(series[i]);
            
            // Update color of list divs
            $('#list .item[data-symbol="' + item.name + '"]').css('border-color', item.color);
        }
    },

    // Remove line of the chart
    removeLine: function(symbol) {
        if(!Chart.chart) {
            return;
        }
        for(let i=0; i<Chart.chart.series.length; i++) {
            if(Chart.chart.series[i].name == symbol) {
                Chart.chart.series[i].remove();
                break;
            }
        }
    }
};

$(document).ready(function(){
   Chart.init(); 
});