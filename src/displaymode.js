import { colors } from './colors.js'

export default function toggleDisplayMode() {
    let button = document.getElementById("display-mode");
    let body = document.getElementsByTagName("body");
    if (button.innerText.includes("Night")) {
        body[0].style.backgroundColor = colors.night.background;
        body[0].style.color = colors.night.text;
        button.innerText = "Switсh to Day Mode";
        for (let i=0; i < charts.length; i++) {
            if (!!charts[i]) charts[i].setTheme('night');
        }
    } else {
        body[0].style.backgroundColor = colors.day.background;
        body[0].style.color = colors.day.text;
        button.innerText = "Switсh to Night Mode";
        for (let i=0; i < charts.length; i++) {
            if (!!charts[i]) charts[i].setTheme('day');
        }
    }
};
