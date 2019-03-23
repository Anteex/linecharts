import loadJSON from './loadjson.js';
import Chart from './chart.js';
import toggleDisplayMode from './displaymode.js';

loadJSON("chart_data.json")
    .then((result) => {
        const chart_data = JSON.parse(result);

        const chart0 = new Chart("graph-area-0", "graph-legend-0", chart_data[0]);
        const chart1 = new Chart("graph-area-1", "graph-legend-1", chart_data[1]);
        const chart2 = new Chart("graph-area-2", "graph-legend-2", chart_data[2]);
        const chart3 = new Chart("graph-area-3", "graph-legend-3", chart_data[3]);
        const chart4 = new Chart("graph-area-4", "graph-legend-4", chart_data[4]);
    })
    .catch((error) => {
        console.error("Error loading JSON data: " + error);
    });

window.toggleDisplayMode = toggleDisplayMode;
