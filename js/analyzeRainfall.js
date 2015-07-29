function updateProgressBar(percent)
{
    var bars = document.getElementById("bar");
    bars.style.width = percent+"%";

    if (100 === percent)
    {
        bars.parentNode.removeChild(bars);

        bars = document.getElementById("progressbar-parent-id");
        bars.parentNode.removeChild(bars);
    }
}

function meltData(rain)
{
    updateProgressBar(85);

    var newrain = melt(rain,["stateid","districtid", "year_val", "avg", "total", "distname", "districid", "stateid", "statename" ], "month");

    /*
    var index = 0;
    for (var i = 0; i < 3; i++)
    {
        console.log("Before: ", rain[i]); 

        for (var j = 0; j < 12; j++)
        {
            console.log("After[" + index + "]: ", newrain[index]);
            index++;
        }
    }
    */

    return newrain;
}

function startDoingThings()
{
    updateProgressBar(30);
    queue()
        .defer(d3.csv, "data/state-dist-map.csv")
        .defer(d3.csv, "data/all-dist-precip.csv")
        .await(analyze);
}

function drawGraphs(rain)
{
    updateProgressBar(100);

    /***************************************** DATA FORMAT ************************************************************************
     * { month: , value: , _id: , stateid: , districtid: , year_val: , total: ,   avg: ,    statename: "" ,      distname: "" } 
     * { month: , value: , _id: , stateid: , districtid: , year_val: , total: ,   avg: ,    statename: "" ,      distname: "" } 
     * { month: , value: , _id: , stateid: , districtid: , year_val: , total: ,   avg: ,    statename: "" ,      distname: "" } 
     * { month: , value: , _id: , stateid: , districtid: , year_val: , total: ,   avg: ,    statename: "" ,      distname: "" } 
     ******************************************************************************************************************************
     *
     * { "jan",   144.13,  0,     2,         3,            1965,       5813.2999, 484.4416, "HIMACHAL PRADESH", "LAHUL & SPITI" } 
     * { "feb",   536.77,  0,     2,         3,            1965,       5813.2999, 484.4416, "HIMACHAL PRADESH", "LAHUL & SPITI" }
     *
     ******************************************************************************************************************************/

    /*
    for (i = 0; i < 10; i ++)
    {
        var str = d.year_val.toString().concat("/").concat(d.month);
        var date = d3.time.format("%y/%b").parse(str);
        rain[i].date = new Date(date);

        console.log(rain[i].date, " : ", date);
    }
    */

    var cf = crossfilter(rain);
    var noOfRecords = cf.size();
    //console.log("Size: ", noOfRecords);

    var monthlyTotalDim = cf.dimension(function(d) {
        return d.month;
        /*
        switch (d.month)
        {
            case "jan":
                return new Date(2015, 0, 1);
            break;

            case "feb":
                return new Date(2015, 1, 1);
            break;

            default:
                return new Date(2015, 4, 1);
            break;
        }
        */
    });

    var monthlyValue = monthlyTotalDim.group().reduceSum(function(d) {
        return d.value;
    });

    var jan = monthlyTotalDim.group().reduceSum(function(d) {
        if ("jan" === d.month) return d.value;
        else return 0;
    });
    var feb = monthlyTotalDim.group().reduceSum(function(d) {
        //if ("feb" === d.month) return d.value;
        return d.value;
    });
    /*
    var mar = monthlyTotalDim.group().reduceSum(dc.pluck('mar'));
    var apr = monthlyTotalDim.group().reduceSum(dc.pluck('apr'));
    var may = monthlyTotalDim.group().reduceSum(dc.pluck('may'));
    var jun = monthlyTotalDim.group().reduceSum(dc.pluck('jun'));
    var jul = monthlyTotalDim.group().reduceSum(dc.pluck('jul'));
    var aug = monthlyTotalDim.group().reduceSum(dc.pluck('aug'));
    var sep = monthlyTotalDim.group().reduceSum(dc.pluck('sep'));
    var oct = monthlyTotalDim.group().reduceSum(dc.pluck('oct'));
    var nov = monthlyTotalDim.group().reduceSum(dc.pluck('nov'));
    var dece = monthlyTotalDim.group().reduceSum(dc.pluck('dece'));
    */

    //var minYear = yearDim.bottom(1)[0].year_val;
    //var maxYear = yearDim.top(1)[0].year_val;
    var lYear = new Date(1901, 0, 1);
    var rYear = new Date(2001, 11, 1);

    var monthlyRainLine = dc.lineChart("#rainfall-chart");
    monthlyRainLine
        .width(1000).height(300)
        .margins({top: 50, right: 10, bottom: 50, left: 120})
        .dimension(monthlyTotalDim)
        .elasticX(true)
        .x(d3.time.scale().domain([lYear, rYear]))
        //.x(d3.time.scale().domain([new Date(2013, 6, 18), new Date(2013, 6, 24)]))
        //.x(d3.scale.linear().domain([1, 12]))
        //.ticks(d3.time.months)
        .group(jan, "Jan")
        .stack(feb, "Feb")
        /*
        .stack(mar, "Mar")
        .stack(apr, "Apr")
        .stack(may, "May")
        .stack(jun, "Jun")
        .stack(jul, "Jul")
        .stack(aug, "Aug")
        .stack(sep, "Sep")
        .stack(oct, "Oct")
        .stack(nov, "Nov")
        .stack(dece, "Dec")
        */
        .elasticY(true)
        //.xAxis().ticks(4)
        .renderArea(true)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        //.yAxisLabel("Avg Rainfall (mm)")
        .xAxisLabel("Month")
        .valueAccessor(function (d) {
            return d.value;
        })
        .legend(dc.legend().x(20).y(20).itemHeight(10).gap(5));
    /** Gives descending-sorted array of grouped items.  **/
    /*
    var top20 = monthlyValue.top(20);
    for (var i = 0; i < 13; i++)
    {
        console.log(top20[i]);
    }
    */


    /** Gives descending-sorted array of grouped items. Our case - starts with "Sep".
    var top20 = monthlyTotalDim.top(20);
    */

    //dc.renderAll();
}

function analyze(error, st_dist_map, rain)
{
    updateProgressBar(40);

    if (error) { console.log(error); }

    st_dist_map.forEach(function (d) {
        d.statecode = +d.statecode;
        d.districtcode = +d.districtcode;
    });

    updateProgressBar(50);

    rain.forEach(function (d) {
        d.stateid = +d.stateid;
        d.districtid = +d.districtid;
        d.year_val = +d.year_val;
        //d.year_val = new Date(d.year_val, 1, 0);
        //d.year_val = d.year_val.getFullYear();
        d.jan = +d.jan;
        d.feb = +d.feb;
        d.mar = +d.mar;
        d.apr = +d.apr;
        d.may = +d.may;
        d.jun = +d.jun;
        d.jul = +d.jul;
        d.aug = +d.aug;
        d.sep = +d.sep;
        d.oct = +d.oct;
        d.nov = +d.nov;
        d.dece = +d.dece;
        d.total = d.jan + d.feb + d.mar + d.apr + d.may + d.jun + d.jul + d.aug + d.sep + d.oct + d.nov + d.dece;
        d.avg = d.total / 12;
    });


    updateProgressBar(60);

    rain.forEach(function(d) {
        //console.log(d.year_val);
        st_dist_map.forEach(function(map) {
            if ((d.stateid === map.statecode) && (d.districtid === map.districtcode))
            {
                d.statename = map.statename;
                d.distname = map.district;
            }
        });
    });

    updateProgressBar(80);
    var moltenData = melt(rain,["stateid","districtid", "year_val", "avg", "total", "distname", "districid", "stateid", "statename" ], "month");
    drawGraphs(moltenData);
}
