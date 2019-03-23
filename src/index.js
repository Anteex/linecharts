import loadJSON from './loadjson.js';
import Chart from './chart.js';
import toggleDisplayMode from './displaymode.js';

loadJSON("chart_data.json")
    .then((result) => {
        const chart_data = JSON.parse(result);
        chart_data.forEach((item, i) => {
            let page = document.createElement('a');
            page.setAttribute("href", "?n=" + i);
            page.innerText = i;
            document.getElementById("pages").appendChild(page);
            let space = document.createElement("span");
            space.classList.add("sps");
            document.getElementById("pages").appendChild(space);
        });
        let url = new URL(window.location.href);
        let n = url.searchParams.get("n");
        if (!n) {n = 0};
        const data = chart_data[n];
        const chart = new Chart("graph-area", "graph-legend", data);
    })
    .catch((error) => {
        console.error("Error loading JSON data: " + error);
    });

window.toggleDisplayMode = toggleDisplayMode;
