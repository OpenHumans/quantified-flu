/**
 * @author Basile MORANE
 * @date Juil 2020
 * @fileoverview Display the list of the public symptom tracking reports
 */
getReportingSymptom(url, id, link);
/**
 * @function getReportingSymptom
 * @description Read the Json file and call the main function whith the good data
 * @param {String} url - of the file we propose to click on  
 * @param {Number} id - of the member who propose his public data
 * @param {String} link - to get to the visualization of member's data
 * @function getJSON(url,data)
 */
function getReportingSymptom(url, id, link) {
    $.getJSON(url, function (data) {
        main(id, data, link);
    });
}
/**
 * @function main 
 * @description Display on screen a line table wich all the different informations 
 * @description First / Last days of reports - member id - number of reports - number of sick incident - data sources availables
 * @param {Number} id - of the member who propose his public data
 * @param {String} data - JSON file
 * @param {String} link - to get to the visualization of member's data
 * @function getMessageDate()
 * @function getReports()
 * @function getSickIncident()
 * @function getDataSource()
 */
function main(id, data, link) {
    if (data.symptom_report.length > 0) {
        let date = document.createElement('a');
        date.id = "date";
        var desiredText = getMessageDate(data);
        var desiredLink = link;
        date.setAttribute('href', desiredLink);
        date.innerHTML = desiredText;
        document.getElementById("public-list-report-symptom").appendChild(date);

        let memberid = document.createElement("td");
        memberid.id = "memberid";
        memberid.textContent = id;
        document.getElementById("public-list-report-symptom").appendChild(memberid);
        let report = document.createElement("td");
        report.id = "report";
        report.textContent = getReports(data);
        document.getElementById("public-list-report-symptom").appendChild(report);
        let sickincident = document.createElement("td");
        sickincident.id = "sickincident";
        sickincident.textContent = getSickIncident(data);
        document.getElementById("public-list-report-symptom").appendChild(sickincident);
        let datasource = document.createElement("td");
        datasource.id = "datasource";
        datasource.textContent = getDataSource(data);
        document.getElementById("public-list-report-symptom").appendChild(datasource);
    }
}
/**
 * @function getDataSource
 * @description Return all the wearable data sources available in the file 
 * @param {*} data - JSON file
 *  @returns {datasource}
 */
function getDataSource(data) {
    var datasource = "";
    if (data.apple_health_summary != undefined)
        datasource += "Apple watch ";
    if (data.garmin_heartrate != undefined )
        datasource += "Garmin ";
    if (data.fitbit_summary != undefined)
        datasource += "Fitbit ";
    if (data.googlefit_heartrate != undefined)
        datasource += "Google fit ";
    if (data.oura_sleep_summary != undefined)
        datasource += "Oura ";
    if (data.apple_health_summary == undefined && data.garmin_heartrate == undefined && data.fitbit_summary == undefined && data.googlefit_heartrate == undefined && data.oura_sleep_summary == undefined && data.oura_sleep_summary == undefined)
        datasource = "No connected data sources ";
    return datasource;
}
/**
 * @function getSymptomName
 * @description Function returns an array with all the diffents names of the symptoms in the file of the user
 * @param {Array} data - JSON file 
 * @function Set()
 * @function Array.from()
 * @returns {Array}
 */
function getSymptomName(data) {
    var cntfile = 0;
    var keyfile = [];
    for (let i = 0; i < data.symptom_report.length; i++) {
        for (var j in data.symptom_report[i].data) {
            keyfile[cntfile] = j;
            cntfile++;
        }
    }
    return Array.from(new Set(keyfile));
}
/**
 * @function getSickIncident
 * @description Return the number of reported sick incidents 
 * @param {*} data - JSON file
 * @function getSymptomName
 * @returns {cntSickIncident}
 */
function getSickIncident(data) {
    var cnt = 0, cntDayReport = 0, cntSickIncident = 0; cntlastday = 0;
    var setKeyfile = getSymptomName(data);
    JSON.parse(JSON.stringify(data, null, '\t'), function (key, value) {
        for (let i = 0; i < setKeyfile.length; i++) {
            if (key === setKeyfile[i] && value > 0 && value < 5) {
                cnt++;
                break;
            }
        }
        if (key == setKeyfile[0]) {
            cntDayReport++;
            if (cnt > 0) {
                cntSickIncident++;
                cnt = 0;
            }
        }
        if (cntDayReport == data.symptom_report.length && value > 0 && value < 5)
            cntlastday ++;
    });
    if (cntlastday  > 0)
        cntSickIncident++;
    return cntSickIncident;
}
/**
 * @function getReports
 * @description Return the number of reported days
 * @param {*} data - JSON file
 *  @returns {cnt} 
 */
function getReports(data) {
    var cnt = 0;
    for (let i = 0; i < data.symptom_report.length; i++) {
        cnt++;
    }
    return cnt;
}
/**
 * @function getMessageDate
 * @description Function return an Array of String contening the first date and the last date of the reporting symptom
 * @param {Array} data - Array of date 
 * @function formatdateshow - format the array dd/mm/yy in new format Mar 21, 20
 * @function formatdate - format the array in new format dd/mm/yy
 * @function parseTime - format the date un format date 
 * @returns {Array}
 */
function getMessageDate(data) {
    if (data.symptom_report.length == 1)
        return formatdateshow(formatdate(parseTime(data.symptom_report[0].timestamp)));
    else
        return formatdateshow(formatdate(parseTime(data.symptom_report[0].timestamp))) + " - " + formatdateshow(formatdate(parseTime(data.symptom_report[data.symptom_report.length - 1].timestamp)));

}
/**
 * @function formatdateshow
 * @description This function transform an array of date with a format (dd/mm/yy) in new format (Jan 01 2020)
 * @description We display this format of date on the screen 
 * @param { Array } data - array of the date on format dd/mm/yy
 * @return { day  } - Array of the new formating date of the JSoN File to display
 */
function formatdateshow(data) {
    let day = [];
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = 1; i < months.length + 1; i++) {
        if (i <= 9 && "0" + i == data.split('/')[1])
            day = months[i - 1] + " " + data.split('/')[0] + ", " + data.split('/')[2]
        else if (i > 9 && i == data.split('/')[1])
            day = months[i - 1] + " " + data.split('/')[0] + ", " + data.split('/')[2]
    }
    return day;
}
parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%f%Z");
formatdate = d3.timeFormat("%d/%m/%y");