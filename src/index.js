import loadJSON from './loadjson.js';
import Chart from './chart.js';
import toggleDisplayMode from './displaymode.js';

const charts = []

loadJSON("data/1/overview.json")
    .then((result) => {
        const linechart_data = JSON.parse(result);
        charts[0] = new Chart("graph-area-0", linechart_data, { dataPath: "data/1/"});
    })
    .catch((error) => {
        console.error("Error loading JSON data: " + error);
    })

loadJSON("data/2/overview.json")
    .then((result) => {
        const yscaled_chart_data = JSON.parse(result);
        charts[1] = new Chart("graph-area-1", yscaled_chart_data, { dataPath: "data/2/"});
    })
    .catch((error) => {
        console.error("Error loading JSON data: " + error);
    })

loadJSON("data/3/overview.json")
    .then((result) => {
        const bar_data = JSON.parse(result);
        charts[2] = new Chart("graph-area-2", bar_data, { dataPath: "data/3/"});
    })
    .catch((error) => {
        console.error("Error loading JSON data: " + error);
    })

loadJSON("data/4/overview.json")
    .then((result) => {
        const one_bar_data = JSON.parse(result);
        charts[3] = new Chart("graph-area-3", one_bar_data, { dataPath: "data/4/", initLines: true});
    })
    .catch((error) => {
        console.error("Error loading JSON data: " + error);
    })

loadJSON("data/5/overview.json")
    .then((result) => {
        const percentage_data = JSON.parse(result);
        charts[4] = new Chart("graph-area-4", percentage_data, { dataPath: "" });
    })
    .catch((error) => {
        console.error("Error loading JSON data: " + error);
    })

window.toggleDisplayMode = toggleDisplayMode;
window.charts = charts;
