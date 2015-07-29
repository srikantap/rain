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

    /**
     *
         { month: , value: , _id: , stateid: , districtid: , year_val: , total: , avg: , statename: "" , distname: "" } 
         { month: , value: , _id: , stateid: , districtid: , year_val: , total: , avg: , statename: "" , distname: "" } 
         { month: , value: , _id: , stateid: , districtid: , year_val: , total: , avg: , statename: "" , distname: "" } 
         { month: , value: , _id: , stateid: , districtid: , year_val: , total: , avg: , statename: "" , distname: "" } 

         { month: "jan", value: 144.13, _id: 0, stateid: 2, districtid: 3, year_val: 1965, 
                total: 5813.299999999999, avg: 484.4416666666666, 
                statename: "HIMACHAL PRADESH", distname: "LAHUL & SPITI" } 

         { month: "feb", value: 536.77, _id: 0, stateid: 2, districtid: 3, year_val: 1965, 
                total: 5813.299999999999, avg: 484.4416666666666, 
                statename: "HIMACHAL PRADESH", distname: "LAHUL & SPITI" }
     *
     *
     **/

    var cf = crossfilter(rain);

    var yearDim = cf.dimension(function(d) {
        return (new Date(d.year_val, 1, 0));
    });

    var jan = yearDim.group().reduceSum(function(d) {
        return d.jan / 100;
    });

    var feb = yearDim.group().reduceSum(function(d) {
        return d.feb / 100;
    });

    var mar = yearDim.group().reduceSum(function(d) {
        return d.mar / 100;
    });

    var apr = yearDim.group().reduceSum(function(d) {
        return d.apr / 100;
    });

    var may = yearDim.group().reduceSum(function(d) {
        return d.may / 100;
    });
    var jun = yearDim.group().reduceSum(function(d) {
        return d.jun / 100;
    });
    var jul = yearDim.group().reduceSum(function(d) {
        return d.jul / 100;
    });
    var aug = yearDim.group().reduceSum(function(d) {
        return d.aug / 100;
    });
    var sep = yearDim.group().reduceSum(function(d) {
        return d.sep / 100;
    });
    var oct = yearDim.group().reduceSum(function(d) {
        return d.oct / 100;
    });
    var nov = yearDim.group().reduceSum(function(d) {
        return d.nov / 100;
    });
    var dece = yearDim.group().reduceSum(function(d) {
        return d.dece / 100;
    });

    /*
    var jan = yearDim.group().reduceSum(dc.pluck('jan'));
    var feb = yearDim.group().reduceSum(dc.pluck('feb'));
    var mar = yearDim.group().reduceSum(dc.pluck('mar'));
    var apr = yearDim.group().reduceSum(dc.pluck('apr'));
    var may = yearDim.group().reduceSum(dc.pluck('may'));
    var jun = yearDim.group().reduceSum(dc.pluck('jun'));
    var jul = yearDim.group().reduceSum(dc.pluck('jul'));
    var aug = yearDim.group().reduceSum(dc.pluck('aug'));
    var sep = yearDim.group().reduceSum(dc.pluck('sep'));
    var oct = yearDim.group().reduceSum(dc.pluck('oct'));
    var nov = yearDim.group().reduceSum(dc.pluck('nov'));
    var dece = yearDim.group().reduceSum(dc.pluck('dece'));

    /*
    var avg = yearDim.group().reduceSum(dc.pluck('avg'));
    var total = yearDim.group().reduceSum(dc.pluck('total'));
    */

    var minYear = yearDim.bottom(1)[0].year_val;
    var maxYear = yearDim.top(1)[0].year_val;
    var lYear = new Date(minYear, 1, 0);
    var rYear = new Date(maxYear, 1, 0);

    var totalRainLine = dc.lineChart("#rainfall-chart");
    totalRainLine
        .width(1000).height(300)
        .margins({top: 50, right: 10, bottom: 50, left: 120})
        .dimension(yearDim)
        .elasticX(true)
        //.x(d3.time.scale().domain([minYear, maxYear]))
        .x(d3.time.scale().domain([lYear, rYear]))
        .group(jan, "Jan")
        .stack(feb, "Feb")
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
        .elasticY(true)
        //.xAxis().ticks(4)
        .renderArea(true)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        //.yAxisLabel("Avg Rainfall (mm)")
        .xAxisLabel("Year")
        .valueAccessor(function (d) {
            return d.value;
        })
        .legend(dc.legend().x(20).y(20).itemHeight(10).gap(5));


    var stateDim = cf.dimension(function(d) {
        return (d.stateid.toString() + "." + d.statename).toString();
    });
    var avgRain = stateDim.group().reduceSum(function(d) {return d.avg;});

    var stateRow = dc.rowChart("#state-row-chart");
    stateRow
        .width(1000).height(800)
        .dimension(stateDim)
        .label(function (d) {
            return d.key.split(".")[1];
        })
        .group(avgRain)
        .elasticX(true);

    /*
    var distDim = cf.dimension(function(d) {
        return d.distname;
    });
    var distRain = distDim.group().reduceSum(function(d) {return d.total;});
    var distRainPie = dc.pieChart("#dist-pie-chart");
    distRainPie
        .width(300).height(300)
        //.slicesCap(15)
        .dimension(distDim)
        .group(avgRain)
        .innerRadius(15)
        .legend(dc.legend());
        */

    var dataTable = dc.dataTable("#data-table");
    dataTable
        .dimension(stateDim)
        //.group(function(d) { return d.year_val; })
        .group(function(d) { return "<center> Data Table </center> " })
        //.group(function(d) { return "<center> Data Table </center> " })
        .size(120)
        .columns([
            function(d) {return d.statename; },
            function(d) {return d.distname; },
            function(d) {return d.year_val; },
            function(d) {return Math.round(d.jan); },
            function(d) {return Math.round(d.feb); },
            function(d) {return Math.round(d.mar); },
            function(d) {return Math.round(d.apr); },
            function(d) {return Math.round(d.may); },
            function(d) {return Math.round(d.jun); },
            function(d) {return Math.round(d.jul); },
            function(d) {return Math.round(d.aug); },
            function(d) {return Math.round(d.sep); },
            function(d) {return Math.round(d.oct); },
            function(d) {return Math.round(d.nov); },
            function(d) {return Math.round(d.dece); },
            function(d) {return Math.round(d.avg); },
            function(d) {return Math.round(d.total); },
        ])
        .sortBy(function(d){ return d.avg; })
        .order(d3.descending);

    dc.renderAll();
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

    var format = d3.time.format("%Y");
    rain.forEach(function (d) {
        d.stateid = +d.stateid;
        d.districtid = +d.districtid;
        //d.year_val = +d.year_val;
        d.year_val = new Date(d.year_val, 1, 0);
        d.year_val = d.year_val.getFullYear();
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
    //console.log("After", moltenData[0], moltenData[1]);
    //drawGraphs(rain);
}
