/**
 * @author Basile Morane
 * @description event.js (javascript). Juillet 2020
 * @fileOverview This file is useful for displaying on screen the graphics of a sick incident
 */
/** @type {number} */gridSize = 29;
/** @type {number} */heightGraph = 14 * gridSize;
/** @type {number} */margin = { top: 2, right: -2, bottom: 27, left: 2 };
creategraphics(url);
/** * @description	Acces to the JSON file 
 * @param { String } url of the JSON file
 */ function creategraphics(url) {
    $.getJSON(url, function (data) {
        main(data);
    })
} /** * @description	main function which allows you to display the graphics corresponding to the existing data. 
 * @param { Array } data of the JSON file
 */ function main(data) {
    type = "event";
    fitbit = controlWearableDatafromfile(data, 'fitbit');
    apple = controlWearableDatafromfile(data, 'apple');
    oura = controlWearableDatafromfile(data, 'oura');
    ouraHR = controlWearableDatafromfile(data, 'ouraHR');
    garmin = controlWearableDatafromfile(data, 'garmin');
    google = controlWearableDatafromfile(data, 'google');
    ourares = controlWearableDatafromfile(data, 'ourares');
    fitbitintraday = false;//controlWearableDatafromfile(data, 'fitbitintraday');
    maxHr = 0; axiscombined = []; propcombined = []; revert = [0, 0, 0, 0, 0, 0, 0, 0];
    databasename = getDataSourceonDay(data);
    databasenameFirstdayname = getFirstDataSourceonDay(data);
    databasenameLastdayname = getLastDataSourceonDay(data);
    numberdaysongraph = getnumberday(data, databasenameFirstdayname, databasenameLastdayname);
    setrevert();
    cntbttHr = maxHr;
    if (fitbit == true || apple == true || oura == true || ouraHR == true || garmin == true || google == true || ourares == true || fitbitintraday == true) {
        createWearableDataSvg('wearable-graph', ((numberdaysongraph + 1) * gridSize), 'wearable-legend', (heightGraph), 'wearable-title', heightGraph / 4, 'wearable-choice');
        getButtonChoice(makeAchoice);
        tooltipChoice(data);
    }
} /** * @function tooltipChoice
 * @description	function to control the display of the graphics with an inteface of multiple buttons (click / double click)
 * @param { Array } data of the JSON file
 */ function tooltipChoice(data) {
    click = 1;
    loadGroupDataSource(data);
    selectedGroupButton();
    axiscombined = getCombineAxisY(revert);
    propcombined = getSum(revert);
    graphicsGroup();
    d3.selectAll("#circle-choice-heartrate")
        .on("click", function (d) {
            classButton = this.getAttribute('class');
            controlGestionclick();
            axiscombined = getCombineAxisY(revert);
            propcombined = getSum(revert);
            graphicsGroup();
            selectedGroupButton();
        })
    d3.selectAll("#circle-choice-heartrate").on("dblclick", function (d) {
        classButton = this.getAttribute('class');
        controlGestiondbclick();
        axiscombined = getCombineAxisY(revert);
        propcombined = getSum(revert);
        graphicsGroup();
        selectedGroupButton();
    })
} /** * @function graphicsGroup
* @description	function to group and display all the differente data source
* @description	Control display of the X-axis / Y-axis / Title graphics
*/
function graphicsGroup() {
    if (revert[1] == 1 || revert[2] == 1 || revert[3] == 1 || revert[4] == 1 || revert[5] == 1 || revert[7] == 1) {
        removeGroup('heart-rate-title-ctn', 'heart-rate-axisX-cnt', 'heart-rate-axisY-cnt', 'sick-intraday-incident');
        createTitle(titlegroup, "Heart rate evolution", 'heart-rate-title-ctn', '50%');
        createLegendAxeY(legendgroup, axiscombined, "HEART RATE [BPM]", 'heart-rate-axisY-cnt');
        loadAxisX(databasename);
        loadAxisReportedSickIncident(databasename);
    }
    if (revert[1] == 0 && revert[2] == 0 && revert[3] == 0 && revert[4] == 0 && revert[5] == 0) {
        removeGroup('heart-rate-title-ctn', 'heart-rate-axisX-cnt', 'heart-rate-axisY-cnt', 'sick-intraday-incident');
    }
    if (oura == true) mainContainer_display_single_data_source (revert[0], 'oura-temperature', finaldataOuraTemp, axiscombined, TemperatureOuraAxis, ouratemp_sum, numberdaysongraph, ouratempreportedIncident, 0, ouratempday, tempyear, "#beaed4", "Temperature evolution", "TEMPERATURE BODY");
    if (apple == true) mainContainer_display_multiple_data_source(revert[1], "apple", finaldataAppleWatch, axiscombined, propcombined, numberdaysongraph, applereportedIncident, applecompare, controlday, appleyear, "#66c2a5", "bpm");
    if (fitbit == true) mainContainer_display_multiple_data_source(revert[2], "fitbit", newdataFitbit, axiscombined, propcombined, numberdaysongraph, fitbitreportedIncident, fitbitcompare, newfitbitdate, fitbityear, "#fc8d62", "bpm");
    if (ouraHR == true) mainContainer_display_multiple_data_source(revert[3], "oura", finaldataOura, axiscombined, propcombined, numberdaysongraph, ourareportedIncident, ouracompare, ouracontrolday, ourayear, "#8da0cb", "bpm");
    if (garmin == true) mainContainer_display_multiple_data_source(revert[4], "garmin", finaldata_garmin, axiscombined, propcombined, numberdaysongraph, garminreportedIncident, garmincompare, controlday_garmin, garminyear, "#e78ac3", "bpm");
    if (google == true) mainContainer_display_multiple_data_source(revert[5], "google", finaldataGoogle, axiscombined, propcombined, numberdaysongraph, googlereportedIncident, googlecompare, googlecontrolday, googleyear, "#a6d854", "bpm");
    if (ourares == true) mainContainer_display_single_data_source (revert[6], 'oura-resp', finaldataOuraRes, ResdayAxis, axisRes_oura, ouraresp_sum, numberdaysongraph, ourarespreportedIncident, 0, controldayRes, resyear, "#97BC5F", "Respiratory rate evolution", "RESPIRATORY RATE");
}
/**
 * @function loadAxisX
 * @description	Display the axis X on screen of the data source with the more day in its reports
 * @param { String } databasename - the name of the data source with the more day in its reports
 * @function createLegendAxeX - dislay on screen 
 */
function loadAxisX(databasename) {
    if (databasename == 'fitbit')
        createLegendAxeX(maingroup, formatdateshow2(dayAxis_fitbit, ""), '20' + fitbityear[0], "heart-rate-axisX-cnt");
    else if (databasename == 'apple')
        createLegendAxeX(maingroup, formatdateshow2(appledayAxis, ""), '20' + appleyear[0], "heart-rate-axisX-cnt");
    else if (databasename == 'ouraHR')
        createLegendAxeX(maingroup, formatdateshow2(ouradayAxis, ""), '20' + ourayear[0], "heart-rate-axisX-cnt");
    else if (databasename == 'garmin')
        createLegendAxeX(maingroup, formatdateshow2(dayAxis_garmin, ""), '20' + garminyear[0], "heart-rate-axisX-cnt");
    else if (databasename == 'google')
        createLegendAxeX(maingroup, formatdateshow2(googledayAxis, ""), '20' + googleyear[0], "heart-rate-axisX-cnt");
}
/**
 * @function loadAxisReportedSickIncident
 * @description	Display the reported sick incident day on screen of the data source with the more day in its reports
 * @param {*} databasename - String of the data source base 
 * @function showreportedSickIncident - display on screen 
 */
function loadAxisReportedSickIncident(databasename) {
    if (databasename == 'fitbit')
    showreportedSickIncident(maingroup, (fitbitreportedIncident + fitbitcompare) + '/0',  "sick-intraday-incident");
    else if (databasename == 'apple')
    showreportedSickIncident(maingroup, (applereportedIncident + applecompare) + '/0',  "sick-intraday-incident");
    else if (databasename == 'ouraHR')
    showreportedSickIncident(maingroup, (ourareportedIncident + ouracompare) + '/0', "sick-intraday-incident");
    else if (databasename == 'garmin')
    showreportedSickIncident(maingroup, (garminreportedIncident + garmincompare) + '/0',  "sick-intraday-incident");
    else if (databasename == 'google')
    showreportedSickIncident(maingroup, (googlereportedIncident + googlecompare) + '/0', "sick-intraday-incident");
}
/**
 * @description Temperature or Respiratory displaying - single data source 
 * @description Display on screen (if data source selected) all svg element depending from this data source
 * @description Chart point - Axis X - Axis Y - Sum & standart deviation - reported incident - data on tooltip  
 * @param {*} booleandisplay - variable of click mouse gestion 
 * @param {*} type - name of the data source 
 * @param {*} datavalues - values of this data source 
 * @param {*} dataAxis values of the axis X 
 * @param {*} dataAxisY - values of the axis Y 
 * @param {*} propcombined - sum & std deviation data 
 * @param {*} numberdaysongraph  - witdh of the graphics  
 * @param {*} reportedIncident - number of days between the first day and the report of the sick incident 
 * @param {*} compare - difference between the first day of al data source and the first day of this data source
 * @param {*} dataday - array of the day 
 * @param {*} datayear - to display on screen 
 * @param {*} color - unique color for the data source
 * @param {*} msgTitle - String for displaying a message for the graphics title
 * @param {*} msgAxis - String for displaying a message for the axis Y graphics
 * @function removeGroup - cleaning the screen from the data
 * @function createLegendAxeX - display on screen the axis X 
 * @function createLegendAxeY - display on screen the axis Y ( and it message)
 * @function createChartePoint - display on screen the chart point 
 * @function tooltipdata - display informations for each point 
 * @function createSumdata - display on screen the sum and the standart deviation 
 * @function showreportedSickIncident - display on screen the day of the reported sick incident 
 */
function mainContainer_display_single_data_source (booleandisplay, type, datavalues, dataAxis, dataAxisY, propcombined, numberdaysongraph, reportedIncident, compare, dataday, datayear, color, msgTitle, msgAxis) {
    if (booleandisplay == 1) {
        removeGroup( type + '-title-ctn', type + '-axisX-cnt', type + '-axisY-cnt', 'circle-'+ type +'-ctn', type + '-sum', type + '-incident');
        createLegendAxeX(maingroup, formatdateshow2(dataAxis, ""), '20' + datayear[0], type + "-axisX-cnt");
        createLegendAxeY(legendgroup, dataAxisY, msgAxis, type + '-axisY-cnt');
        createTitle(titlegroup, msgTitle, type + '-title-ctn', '50%');
        createChartePoint(maingroup, datavalues, dataAxisY, "circle-" + type + "-ctn", color, (gridSize / 10), 0);
        tooltipdata("circle-" + type + "-ctn", formatdateshow2(dataday, '20' + datayear[0]), "", color);
        createSumdata(maingroup, propcombined, dataAxisY, type + '-sum', numberdaysongraph);
        showreportedSickIncident(maingroup, (reportedIncident) + '/0', type + "-incident");
    } else {
        removeGroup( type + '-title-ctn', type + '-axisX-cnt', type + '-axisY-cnt', 'circle-'+ type +'-ctn', type + '-sum', type + '-incident');
    }
}
/**
 * @description Display on a new HTML element the data values of the day we select by clicking on it 
 * @param {*} circleid - id of the select circle 
 * @param {Array} data - day of the displaying graphics 
 * @param {*} msg - msg to display 
 * @param {*} color - color of the graphics point displayng on screen and selected 
 */
function tooltipdata(circleid, data, msg, color) {
    tooltip = d3.select("#wearable-title").append("div").attr("class", "svg-tooltip").style("position", "absolute").style("visibility", "hidden");
    d3.selectAll("#" + circleid)
        .on("mouseover", function (d) {
            let coordXY = this.getAttribute('class').split('- ')[1];
            d3.select(this).attr("r", gridSize / 5).attr('stroke-width', 1);
            legendCircle.append("circle").attr("id", "rect-legend").attr("class", "rect-legend").attr("cx", 65 + "%").attr("cy", 50 + "%").attr("r", gridSize / 5).attr("fill", color);
            legendCircle.append("text").attr("id", "text-legend").attr("class", "text-legend").text(data[coordXY] + " " + d + " " + msg).attr("x", 69 + "%").attr("y", 60 + "%").attr("fill", "black").style("font-weight", "200");
        })
        .on("mouseout", function () {
            d3.select(this).attr("r", gridSize / 10).style("stroke", "#015483").style("stroke-width", "0.5");
            d3.selectAll("#rect-legend").style("visibility", "hidden");
            d3.selectAll("#text-legend").style("visibility", "hidden");
        });
}
/* Functions - Graphic element visualisation */
/**
 * @description Instancy the svg variable with a HTML div (width, height...)
 * @param {*} div1 - maingroup - dislay of the graphics and X-axis
 * @param {*} widthdiv1 - width of the size depending of the number of days
 * @param {*} div2 legendgroup - display of the Y-axis
 * @param {*} heightdiv2 
 * @param {*} div3 ) titlegroup - display of the title graphics
 * @param {*} heightdiv3 
 * @param {*} divChoice - makeAchoice
 */
function createWearableDataSvg(div1, widthdiv1, div2, heightdiv2, div3, heightdiv3, divChoice) {
    maingroup = d3.select('#' + div1).append("svg").attr("class", "svg").attr("width", widthdiv1).attr("height", heightdiv2);
    legendgroup = d3.select('#' + div2).append("svg").attr("class", "svg").attr("width", 100 + "%").attr("height", heightdiv2);
    titlegroup = d3.select('#' + div3).append("svg").attr("class", "svg").attr("width", 100 + "%").attr("height", heightdiv3 / 2);
    makeAchoice = d3.select('#' + divChoice).append("svg").attr("class", "svg").attr("width", 100 + "%").attr("height", heightdiv3 * 1.7);
    legendCircle = d3.select('#wearable-legend-circle').append("svg").attr("class", "svg").attr("width", 100 + "%").attr("height", heightdiv3 / 2);
}
/**
 * @description Display on screen the button which allow us to display or not all the available data source 
 * @param {Element} svgName - svg element name  
 * @function createButton
 * @function setAttributButton
 */
function getButtonChoice(svgName) {
    classname = [];
    colorscale = [];
    legendname = [];
    cnt = 0;
    classnameHeartRate = [];
    colorscaleHeartRate = [];
    legendnameHeartRate = [];
    cntHR = 0;
    classnameTemperature = [];
    colorscaleTemperature = [];
    legendnameTemperature = [];
    cntTP = 0;
    classnameRespirator = [];
    colorscaleRespirator = [];
    legendnameRespirator = [];
    cntRS = 0;
    setAttributButton(0);
    createButton(svgName, 1, classname, legendname, colorscale, 0, (gridSize * .2));
    createButton(svgName, 2, classnameHeartRate, legendnameHeartRate, colorscaleHeartRate, (classname.length), (classname.length * gridSize * 1.55));
}
/**
 * @description Display on screen an button element svg with it own id and classname 
 * @param {*} svgName - element svg
 * @param {*} type - 1: categories / 2; data source
 * @param {*} dataclassname specific button class 
 * @param {*} datalegend - specific button text
 * @param {*} datacolor - specific button color
 * @param {*} marginTop1 - x position 
 * @param {*} marginTop2 - y position 
 */
function createButton(svgName, type, dataclassname, datalegend, datacolor, marginTop1, marginTop2) {
    if (marginTop1 == 1) {
        margintest = .5
    } else
        margintest = 1;

    svgName.selectAll('circle-choice')
        .data(dataclassname)
        .enter()
        .append("circle")
        .attr('id', 'circle-choice-heartrate')
        .attr('class', function (d, i) { return dataclassname[i] })
        .attr("cx", function (d, i) {
            if (type == 1)
                return (5 + (i * 35) + '%')
            else if (type == 2 && i > 1 && i <= 3)
                return (45 * margintest) + '%'
            else if (type == 2 && i > 3)
                return (65 * margintest) + '%'
            else if (type == 2 && i >= 0 && i <= 1)
                return (25 * margintest) + '%'
        })
        .attr("cy", function (d, i) {
            if (type == 1)
                return (10 + '%')
            else if (type == 2 && i > 1 && i <= 3)
                return (15) + ((i - 1) * 15) + '%'
            else if (type == 2 && i >= 0 && i <= 1)
                return (15) + ((i + 1) * 15) + '%'
            else if (type == 2 && i > 3)
                return (15) + ((i - 3) * 15) + '%'
        })
        .attr("r", gridSize / (2 * type))
        .attr("stroke", "#e2e2e2")
        .style("fill", function (d, i) {
            if (type == 1 && d == 'Temperature') {
                createLinearGradient(svgName, colorscaleTemperature, d);
                return "url(#" + d + ")"
            } else if (type == 1 && d == 'HeartRate') {
                createLinearGradient(svgName, colorscaleHeartRate, d);
                return "url(#" + d + ")"
            }
            else
                return datacolor[i];
        });
    svgName.selectAll(".daysLabel")
        .data(datalegend)
        .enter().append("text")
        .attr("class", function (d, i) {
            if (type == 1)
                return "textbuttonprincipal"
            else return "textbutton"
        })
        .text(function (d) { return d; })
        .style("fill", "#212529")
        .attr("x", function (d, i) {
            if (type == 1)
                return (7 + (i * 35) + '%')
            else if (type == 2 && i > 1 && i <= 3)
                return (2 + 45 * margintest) + '%'
            else if (type == 2 && i > 3)
                return (2 + 65 * margintest) + '%'
            else if (type == 2 && i >= 0 && i <= 1)
                return (2 + 25 * margintest) + '%'
        })
        .attr("y", function (d, i) {
            if (type == 1)
                return (13 + '%')
            else if (type == 2 && i > 1 && i <= 3)
                return (17) + ((i - 1) * 15) + '%'
            else if (type == 2 && i >= 0 && i <= 1)
                return (17) + ((i + 1) * 15) + '%'
            else if (type == 2 && i > 3)
                return (17) + ((i - 3) * 15) + '%'
        })
        .style("text-anchor", "start")
        .style("font-weight", "200")
        .attr("font-size", (.75 - (type / 8)) + "rem");
}
/**
 * @description Get the maximum number of day to create the width of the chart point
 * @param {*} data - JSON file
 * @param {String} sourceFirstday - name of the data source whiwh have the first day of data 
 * @param {String} sourceLastday - name of the data source whiwh have the last day of data 
 * @returns {difference} Number 
 */
function getnumberday(data, sourceFirstday, sourceLastday) {
    if (sourceFirstday != 'none' && sourceLastday != 'none') {
        firstday = 0;
        lastday = 0;
        if (sourceFirstday == 'fitbit') {
            firstday = parseTimeTemp(data.fitbit_summary[0].timestamp).getTime();
        }
        if (sourceFirstday == 'ouraHR') {
            firstday = parseTimeTemp(data.oura_sleep_summary[0].timestamp).getTime();
        }
        if (sourceFirstday == 'google') {
            firstday = parseTimeGarmin(data.googlefit_heartrate[0].timestamp).getTime();
        }
        if (sourceFirstday == 'garmin') {
            firstday = parseTimeGarmin(data.garmin_heartrate[0].timestamp).getTime();
        }
        if (sourceFirstday == 'apple') {
            firstday = parseTime(data.apple_health_summary[0].timestamp).getTime();
        }
        if (sourceFirstday == 'oura') {
            firstday = parseTimeTemp(data.oura_sleep_summary[0].timestamp).getTime();
        }
        if (sourceFirstday == 'ourares') {
            firstday = parseTimeTemp(data.oura_sleep_summary[0].timestamp).getTime();
        }


        if (sourceLastday == 'fitbit') {
            lastday = parseTimeTemp(data.fitbit_summary[data.fitbit_summary.length - 1].timestamp).getTime();
        }
        if (sourceLastday == 'ouraHR') {
            lastday = parseTimeTemp(data.oura_sleep_summary[data.oura_sleep_summary.length - 1].timestamp).getTime();
        }
        if (sourceLastday == 'google') {
            lastday = parseTimeGarmin(data.googlefit_heartrate[data.googlefit_heartrate.length - 1].timestamp).getTime();
        }
        if (sourceLastday == 'apple') {
            lastday = parseTime(data.apple_health_summary[data.apple_health_summary.length - 1].timestamp).getTime();
        }
        if (sourceLastday == 'garmin') {
            lastday = parseTimeGarmin(data.garmin_heartrate[data.garmin_heartrate.length - 1].timestamp).getTime();
        }
        if (sourceLastday == 'oura') {
            lastday = parseTimeTemp(data.oura_sleep_summary[data.oura_sleep_summary.length - 1].timestamp).getTime();
        }
        if (sourceLastday == 'ourares') {
            lastday = parseTimeTemp(data.oura_sleep_summary[data.oura_sleep_summary.length - 1].timestamp).getTime();
        }
        var difference = Math.round((lastday - firstday) / (86400000));
    } else
        var difference = 0;
    return difference;
}
