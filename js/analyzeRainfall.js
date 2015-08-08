/**
 * Get bar element and increment it by 'percent'
 **/
function updateProgressBar(percent)
{
    var bars = document.getElementById("bar");
    bars.style.width = percent+"%";

    /* Hide bar when fully loaded (i.e, 100%) */
    if (100 === percent)
    {
        bars.parentNode.removeChild(bars);

        bars = document.getElementById("progressbar-parent-id");
        bars.parentNode.removeChild(bars);
    }
}

/**
 * Invoked when document is loaded.
 * Read csv files, and invoke analyze
 **/
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

    /**
     * Data will be available in this format:
     * **************************************** DATA FORMAT ************************************************************************
     * { month: , value: , _id: , stateid: , districtid: , year_val: , total: ,   avg: ,    statename: "" ,      distname: "" } 
     * { month: , value: , _id: , stateid: , districtid: , year_val: , total: ,   avg: ,    statename: "" ,      distname: "" } 
     * { month: , value: , _id: , stateid: , districtid: , year_val: , total: ,   avg: ,    statename: "" ,      distname: "" } 
     ******************************************************************************************************************************
     * Sample data:
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

    /*
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    */

    var yearDim = cf.dimension(function(d) {
        return d.date.getFullYear();
    });

    /* Calculate yearly average; store in p.avg */
    var yearlyAvg = yearDim.group().reduce(
        //add
        function(p,v) {
            p.count++;
            p.sum += v.value;
            p.avg = p.sum / 100;
            return p;
        },
        //remove
        function(p,v) {
            p.count--;
            p.sum -= v.value;
            p.avg = p.sum / 100;
            return p;
        },
        //init
        function(p,v) {
            return {count:0, avg:0, sum:0};
        }
    );

    /* Calculate feb average; store in p.avg */
    var febAvg = yearDim.group().reduce(
        //add
        function(p,v) {
            if (v.month === "feb")
            {
                var avg = (v.value / 100);
                return avg;
            }
            else return 0;
        },
        //remove
        function(p,v) {
            p.count--;
            p.sum -= v.value;
            p.avg = p.sum / 100;
            return p;
        },
        //init
        function(p,v) {
            return {count:0, avg:0, sum:0};
        }
    );

    /* Calculate May average; store in p.avg */
    var mayAvg = yearDim.group().reduce(
        //add
        function(p,v) {
            if (v.month === "feb")
            {
                p.avg = (v.value / 100);
                return p;
            }
            else return 0;
        },
        //remove
        function(p,v) {
            p.count--;
            p.sum -= v.value;
            p.avg = p.sum / 100;
            return p;
        },
        //init
        function(p,v) {
            return {count:0, avg:0, sum:0};
        }
    );

    /*
    console.log("----------------- Yearly Avgs --------------------------");
    yearlyAvg.top(150).forEach(function (d, i) {
        console.log(d);
    });
    */

    var minYear = yearDim.bottom(1)[0].date.getFullYear();
    var maxYear = yearDim.top(1)[0].date.getFullYear();
    var monthlyRainLine = dc.lineChart("#rainfall-chart");
    monthlyRainLine
        .width(1000).height(300)
        .margins({top: 50, right: 10, bottom: 50, left: 120})
        .dimension(yearDim)
        .elasticX(true)
        .x(d3.time.scale().domain([minYear, maxYear]))
        //.x(d3.time.scale().domain([new Date(2013, 6, 18), new Date(2013, 6, 24)]))
        .group(yearlyAvg, "Year Avg")
        .stack(febAvg, "Feb")
        .stack(mayAvg, "May")
        /*
        .stack(mar1, "Mar")
        .stack(apr1, "Apr")
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
        .xAxisLabel("Years")
        .valueAccessor(function (d) {
            return d.value.avg;
        })
        .legend(dc.legend().x(20).y(20).itemHeight(10).gap(5));


    /****************************ROW CHART*************************************/
    var stateNameDim = cf.dimension(function(d) {
        return d.statename;
    });
    var stateNameGroup = stateNameDim.group();
    var stateAvg = stateNameGroup.reduce(
        //add
        function(p,v) {
            p.count++;
            p.sum += v.value;
            //p.avg = (p.count ? (p.sum / p.count) : 0);
            p.avg = p.sum / p.count;
            return p;
        },
        //remove
        function(p,v) {
            p.count--;
            p.sum -= v.value;
            p.avg = p.sum / p.count;
            return p;
        },
        //init
        function(p,v) {
            return {count:0, avg:0, sum:0};
        }
    );

    var monthDim = cf.dimension(function(d) {
        return d.month;
    });
    var monthGroup = monthDim.group();
    var avgGroup = monthGroup.reduce(
        //add
        function(p,v) {
            p.count++;
            p.sum += v.value;
            //p.avg = (p.count ? (p.sum / p.count) : 0);
            p.avg = p.sum / p.count;
            return p;
        },
        //remove
        function(p,v) {
            p.count--;
            p.sum -= v.value;
            p.avg = p.sum / p.count;
            return p;
        },
        //init
        function(p,v) {
            return {count:0, avg:0, sum:0};
        }
    );

    /*
    console.log("----------------- State Totals --------------------------");
    stateAvg.top(50).forEach(function (d, i) {
        console.log(d);
    });
    */


    var stateRow = dc.rowChart("#state-row-chart");
    stateRow
        .width(800).height(800)
        .dimension(stateNameDim)
        .group(stateAvg)
        //.dimension(monthDim)
        //.group(avgGroup)
        .valueAccessor(function (d) {
            return d.value.avg;
        })
        .elasticX(true);

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

/**
 * Invoked by D3 when csvs are fully read
 **/
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
        d.yearly_avg = d.total / 12;
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

    /* Melt month columns */
    var moltenData = melt(rain,["stateid","districtid", "year_val", "yearly_avg", "total", "distname", "districid", "stateid", "statename" ], "month");

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

function getMonthName(date)
{
}

