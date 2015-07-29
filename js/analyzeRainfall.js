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

    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var monthlyTotalDim = cf.dimension(function(d) {
        return d.date.getMonth();
        //return monthNames[d.date.getMonth()];
    });

    var monthlyValue = monthlyTotalDim.group().reduceSum(function(d) {
        return d.value;
    });

    var jan = monthlyTotalDim.group().reduceSum(function(d) {
        if ("jan" === d.month) return d.value;
        else return 0;
    });
    var feb = monthlyTotalDim.group().reduceSum(function(d) {
        if ("feb" === d.month) return d.value;
        return d.value;
    });
    var mar = monthlyTotalDim.group().reduceSum(function(d) {
        if ("mar" === d.month) return d.value;
        return d.value;
    });
    var apr = monthlyTotalDim.group().reduceSum(function(d) {
        if ("apr" === d.month) return d.value;
        return d.value;
    });
    var may = monthlyTotalDim.group().reduceSum(function(d) {
        if ("may" === d.month) return d.value;
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

    var stateTotalDim = cf.dimension(function(d) {
        return d.statename;
        //return monthNames[d.date.getMonth()];
    });

    var stateTotalValue = stateTotalDim.group().reduceSum(function(d) {
        return d.value;
    });
    var jan1 = stateTotalDim.group().reduceSum(function(d) {
        if ("jan" === d.month) return d.value;
        else return 0;
    });
    var feb1 = stateTotalDim.group().reduceSum(function(d) {
        if ("feb" === d.month) return d.value;
        return d.value;
    });
    var mar1 = stateTotalDim.group().reduceSum(function(d) {
        if ("mar" === d.month) return d.value;
        return d.value;
    });
    var apr1 = stateTotalDim.group().reduceSum(function(d) {
        if ("apr" === d.month) return d.value;
        return d.value;
    });
    var may1 = stateTotalDim.group().reduceSum(function(d) {
        if ("may" === d.month) return d.value;
        return d.value;
    });

    var monthlyRainLine = dc.lineChart("#rainfall-chart");
    monthlyRainLine
        .width(1000).height(300)
        .margins({top: 50, right: 10, bottom: 50, left: 120})
        .dimension(stateTotalDim)
        .elasticX(true)
        //.x(d3.time.scale().domain([lYear, rYear]))
        //.x(d3.time.scale().domain([new Date(2013, 6, 18), new Date(2013, 6, 24)]))
        //.x(d3.scale.linear().domain(["Kar", "Him"]))
        .group(jan1, "Jan")
        .stack(feb1, "Feb")
        .stack(mar1, "Mar")
        .stack(apr1, "Apr")
        .stack(may1, "May")
        /*
        .stack(jun, "Jun")
        .stack(jul, "Jul")
        .stack(aug, "Aug")
        .stack(sep, "Sep")
        .stack(oct, "Oct")
        .stack(nov, "Nov")
        .stack(dece, "Dec")
        */
        .elasticY(true)
        .renderArea(true)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        //.yAxisLabel("Avg Rainfall (mm)")
        .xAxisLabel("Month")
        .valueAccessor(function (d) {
            return d.value;
        })
        .legend(dc.legend().x(20).y(20).itemHeight(10).gap(5));

    dc.renderAll();

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
        /**
         * Update state and district names
         */
        st_dist_map.forEach(function(map) {
            if ((d.stateid === map.statecode) && (d.districtid === map.districtcode))
            {
                d.statename = map.statename;
                d.distname = map.district;
            }
        });
    });

    var moltenData = melt(rain,["stateid","districtid", "year_val", "avg", "total", "distname", "districid", "stateid", "statename" ], "month");

    /**
     * Add new element as a Date object which has Month and Year
     */
    moltenData.forEach(function(d) {
        var month = getMonth(d.month);
        var date = new Date();
        date.setFullYear(d.year_val, month, 1);
        d.date = date;
        //console.log(d.date, d.month, d.year_val, month);
    });

    updateProgressBar(80);
    drawGraphs(moltenData);
}

function getMonthName(date)
{
}

function getMonth(str)
{
    switch (str) {
        case "jan":
            return 0;
            break
        case "feb":
            return 1;
            break
        case "mar":
            return 2;
            break
        case "apr":
            return 3;
            break
        case "may":
            return 4;
            break
        case "jun":
            return 5;
            break
        case "jul":
            return 6;
            break
        case "aug":
            return 7;
            break
        case "sep":
            return 8;
            break
        case "oct":
            return 9;
            break
        case "nov":
            return 10;
            break
        case "dece":
            return 11;
            break
        default:
            window.alert("Bad apple: " + str);
            return -1;
            break;
    }
}
