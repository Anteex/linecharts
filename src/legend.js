import { colors } from './colors.js'

export default class Legend {

    constructor(nodeIdLegend, data, onToggle, lineNames, theme) {
        this.nodeIdLegend = nodeIdLegend;
        this.onToggle = onToggle;
        this.data = data;
        this.theme = theme;
        let styleEl = document.createElement('style');
        document.head.appendChild(styleEl);
        let styleSheet = styleEl.sheet;
        let k=0;
        for (let key in data.names) {
            k+=1;
            let chk = lineNames.includes(this.data.columns[k][0]);
            let name = document.createElement('span');
            name.id = nodeIdLegend + '-' + key;
            name.classList.add('legendItem');
            let bkcolor;
            if (chk) {
                name.innerHTML = '&#10004;&nbsp' + data.names[key];
                bkcolor = data.colors[key];
            } else {
                name.innerHTML = '&nbsp' + data.names[key];
                bkcolor = colors[this.theme].background;
                name.style.color = data.colors[key];
                name.style.backgroundColor = colors[this.theme].background;
            }
            document.getElementById(this.nodeIdLegend).appendChild(name);
            styleSheet.insertRule('#' + nodeIdLegend + '-' + key + ' { background-color: ' + bkcolor + '}')
            styleSheet.insertRule('#' + nodeIdLegend + '-' + key + ' { border-color: ' + data.colors[key] + '}')
            document.querySelector('#' + nodeIdLegend + '-' + key).onclick=this.beforeToggle(key, data.colors[key]).bind(this);
        }
    }

    setTheme(theme) {
        if (!!this.theme && this.theme !== theme) {
            for (let key in this.data.names) {
                let button = document.getElementById(this.nodeIdLegend + '-' + key);
                if (button.style.backgroundColor === colors[this.theme].backgroundRGB) {
                    button.style.backgroundColor = colors[theme].background;
                }
            }
        }
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
                if (button.style.backgroundColor !== colors[this.theme].backgroundRGB ) {
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
