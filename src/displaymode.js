export default function toggleDisplayMode() {
    let button = document.getElementById("display-mode");
    let body = document.getElementsByTagName("body");
    if (button.innerText.includes("Night")) {
        body[0].style.filter = "invert(100%)";
        body[0].style.backgroundColor = "#000";
        button.innerText = "Switсh to Day Mode";
        let lines = document.getElementsByClassName("noInvertColor");
        for (let i=0; i < lines.length; i++) {
            lines[i].style.filter = "invert(100%)";
        }
    } else {
        body[0].style.filter = "invert(0%)";
        body[0].style.backgroundColor = "#fff";
        button.innerText = "Switсh to Night Mode";
        let lines = document.getElementsByClassName("noInvertColor");
        for (let i=0; i < lines.length; i++) {
            lines[i].style.filter = "invert(0%)";
        }
    }
};
