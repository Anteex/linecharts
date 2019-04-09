import loadJSON from './loadjson.js';
import Chart from './chart.js';
import toggleDisplayMode from './displaymode.js';

loadJSON("data/1/overview.json")
    .then((result) => {
        const linechart_data = JSON.parse(result);
        const chart0 = new Chart("graph-area-0", "graph-legend-0", linechart_data);
    })
    .catch((error) => {
        console.error("Error loading JSON data: " + error);
    })

loadJSON("data/2/overview.json")
    .then((result) => {
        const yscaled_chart_data = JSON.parse(result);
        const chart1 = new Chart("graph-area-1", "graph-legend-1", yscaled_chart_data);
    })
    .catch((error) => {
        console.error("Error loading JSON data: " + error);
    })

loadJSON("data/3/overview.json")
    .then((result) => {
        const bar_data = JSON.parse(result);
        const chart2 = new Chart("graph-area-2", "graph-legend-2", bar_data);
    })
    .catch((error) => {
        console.error("Error loading JSON data: " + error);
    })

loadJSON("data/4/overview.json")
    .then((result) => {
        const one_bar_data = JSON.parse(result);
        const chart3 = new Chart("graph-area-3", "graph-legend-3", one_bar_data);
    })
    .catch((error) => {
        console.error("Error loading JSON data: " + error);
    })

loadJSON("data/5/overview.json")
    .then((result) => {
        const percentage_data = JSON.parse(result);
        const chart4 = new Chart("graph-area-4", "graph-legend-4", percentage_data);
    })
    .catch((error) => {
        console.error("Error loading JSON data: " + error);
    })

window.toggleDisplayMode = toggleDisplayMode;
