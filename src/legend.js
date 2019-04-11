import { colors } from './colors.js'

export default class Legend {

    constructor(nodeIdLegend, data, onToggle) {
        this.nodeIdLegend = nodeIdLegend;
        this.onToggle = onToggle;
        let styleEl = document.createElement('style');
        document.head.appendChild(styleEl);
        let styleSheet = styleEl.sheet;
        for (let key in data.names) {
            let name = document.createElement('span');
            name.id = nodeIdLegend + '-' + key;
            name.classList.add('legendItem');
            name.innerHTML ='&#10004;&nbsp' + data.names[key];
            document.getElementById(this.nodeIdLegend).appendChild(name);
            styleSheet.insertRule('#' + nodeIdLegend + '-' + key + ' { background-color: ' + data.colors[key] + '}')
            styleSheet.insertRule('#' + nodeIdLegend + '-' + key + ' { border-color: ' + data.colors[key] + '}')
            document.querySelector('#' + nodeIdLegend + '-' + key).onclick=this.beforeToggle(key, data.colors[key]).bind(this);
        }
    }

    setTheme(theme) {
        this.theme = theme;
    }

    beforeToggle(key, color) {
        return () => {
            let button = document.getElementById(this.nodeIdLegend + '-' + key);
            if (!button.style.width) {
                button.style.width = button.clientWidth + "px";
                button.style.paddingLeft = "0px";
                button.style.paddingRight = "0px";
            }
            if (!!button.style.backgroundColor){
                if (button.style.backgroundColor !== "rgb(255, 255, 255)") {
                    button.style.backgroundColor = colors[this.theme].background;
                    button.style.color = color;
                    button.innerText = button.innerText.substring(1);
                } else {
                    button.style.backgroundColor = color;
                    button.style.color = "#FFFFFF";
                    button.innerHTML = '&#10004;' + button.innerHTML;
                }
            } else {
                button.style.backgroundColor = colors[this.theme].background;
                button.style.color = color;
                button.innerText = button.innerText.substring(1);
            }
            this.onToggle(key);
        }
    }

}
