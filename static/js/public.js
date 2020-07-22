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
    if (data.garmin_heartrate != undefined)
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
 * @function getSickIncident
 * @description Return the number of reported sick incidents 
 * @param {*} data - JSON file 
 * @returns {cnt}
 */
function getSickIncident(data) {
    var cnt = 0;
    for (let i = 0; i < data.symptom_report.length; i++) {
        if (data.symptom_report[i].data.fever != undefined && data.symptom_report[i].data.fever != "" && data.symptom_report[i].data.fever != 0)
            cnt++;
        else if (data.symptom_report[i].data.symptom_anosmia != undefined && data.symptom_report[i].data.symptom_anosmia != "" && data.symptom_report[i].data.symptom_anosmia != 0)
            cnt++;
        else if (data.symptom_report[i].data.symptom_body_ache != undefined && data.symptom_report[i].data.symptom_body_ache != "" && data.symptom_report[i].data.symptom_body_ache != 0)
            cnt++;
        else if (data.symptom_report[i].data.symptom_chills != undefined && data.symptom_report[i].data.symptom_chills != "" && data.symptom_report[i].data.symptom_chills != 0)
            cnt++;
        else if (data.symptom_report[i].data.symptom_cough != undefined && data.symptom_report[i].data.symptom_cough != "" && data.symptom_report[i].data.symptom_cough != 0)
            cnt++;
        else if (data.symptom_report[i].data.symptom_diarrhea != undefined && data.symptom_report[i].data.symptom_diarrhea != "" && data.symptom_report[i].data.symptom_diarrhea != 0)
            cnt++;
        else if (data.symptom_report[i].data.symptom_fatigue != undefined && data.symptom_report[i].data.symptom_fatigue != "" && data.symptom_report[i].data.symptom_fatigue != 0)
            cnt++;
        else if (data.symptom_report[i].data.symptom_headache != undefined && data.symptom_report[i].data.symptom_headache != "" && data.symptom_report[i].data.symptom_headache != 0)
            cnt++;
        else if (data.symptom_report[i].data.symptom_nausea != undefined && data.symptom_report[i].data.symptom_nausea != "" && data.symptom_report[i].data.symptom_nausea != 0)
            cnt++;
        else if (data.symptom_report[i].data.symptom_runny_nose != undefined && data.symptom_report[i].data.symptom_runny_nose != "" && data.symptom_report[i].data.symptom_runny_nose != 0)
            cnt++;
        else if (data.symptom_report[i].data.symptom_short_breath != undefined && data.symptom_report[i].data.symptom_short_breath != "" && data.symptom_report[i].data.symptom_short_breath != 0)
            cnt++;
        else if (data.symptom_report[i].data.symptom_sore_throat != undefined && data.symptom_report[i].data.symptom_sore_throat != "" && data.symptom_report[i].data.symptom_sore_throat != 0)
            cnt++;
        else if (data.symptom_report[i].data.symptom_wet_cough != undefined && data.symptom_report[i].data.symptom_wet_cough != "" && data.symptom_report[i].data.symptom_wet_cough != 0)
            cnt++;
    }
    return cnt;
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