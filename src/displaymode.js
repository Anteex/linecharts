export default function toggleDisplayMode() {
    let buttons = document.getElementsByClassName("display-mode");
    let body = document.getElementsByTagName("body");
    if (buttons[0].innerText.includes("Night")) {
        body[0].style.filter = "invert(100%)";
        body[0].style.backgroundColor = "#000";
        Array.from(buttons).forEach((item) => {
            item.innerText = "Switсh to Day Mode";
        })
        let lines = document.getElementsByClassName("noInvertColor");
        for (let i=0; i < lines.length; i++) {
            lines[i].style.filter = "invert(100%)";
        }
    } else {
        body[0].style.filter = "invert(0%)";
        body[0].style.backgroundColor = "#fff";
        Array.from(buttons).forEach((item) => {
            item.innerText = "Switсh to Night Mode";
        })
        let lines = document.getElementsByClassName("noInvertColor");
        for (let i=0; i < lines.length; i++) {
            lines[i].style.filter = "invert(0%)";
        }
    }
};
