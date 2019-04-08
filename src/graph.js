import Container from './container.js'

export default class Graph extends Container {

    constructor(position, nodeId, data) {
        position.bottom = position.bottom - 30;
        super(position, nodeId, data);

        this.initCanvasBackground();
        this.initCanvasForeground();

        this.canvasFore.onmousemove = (e) => {
            let x = e.x - this.canvasFore.getBoundingClientRect().x;
            let y = e.y - this.canvasFore.getBoundingClientRect().y;
            if (Math.round(x / this.scaleX) >= 0 && Math.round(x / this.scaleX) < (this.frame.end - this.frame.start)) {
                this.drawForeground(Math.round(x / this.scaleX), y)
            }
        };

        this.canvasFore.onmouseout = () => {
            this.clearForeground();
        }

    }

    refresh(position) {
        position.bottom = position.bottom - 30;
        super.refresh(position);

        this.canvasBack.style.left = this.left + "px";
        this.canvasBack.style.top = this.top + "px";
        this.canvasBack.width  = this.width;
        this.canvasBack.height = this.height + 30;

        this.canvasFore.style.left = this.left + "px";
        this.canvasFore.style.top = this.top + "px";
        this.canvasFore.width  = this.width;
        this.canvasFore.height = this.height;
    }

    initCanvasBackground() {
        this.canvasBack = document.createElement('canvas');
        this.canvasBack.style.left = this.left + "px";
        this.canvasBack.style.top = this.top + "px";
        this.canvasBack.width  = this.width;
        this.canvasBack.height = this.height + 30;
        this.canvasBack.style.position = "absolute";
        this.canvasBack.style.zIndex = 5;
        document.getElementById(this.nodeId).appendChild(this.canvasBack);
        this.contextBack = this.canvasBack.getContext("2d");
    }

    drawBackground() {
        let requestId = requestAnimationFrame(() => {
            this.drawGrid();
        })
    }

    drawGrid() {
        this.contextBack.clearRect(0, 0, this.width, this.height + 30);
        let axis = this.axis_numbers(this.min, this.max);
        this.contextBack.beginPath();
        this.contextBack.lineWidth = "1";
        this.contextBack.textAlign = "left";
        this.contextBack.font = "12px Arial";
        for (let i=0; i < axis.length; i++) {
            this.contextBack.strokeStyle = "#182D3B";
            this.contextBack.globalAlpha = 0.1;
            this.contextBack.beginPath();
            this.contextBack.moveTo(this.left + this.padding, this.height - this.padding - (Math.round(axis[i] - this.min) * this.scaleY));
            this.contextBack.lineTo(this.left + this.width - this.padding, this.height - this.padding - (Math.round(axis[i] - this.min) * this.scaleY));
            this.contextBack.stroke();
            this.contextBack.globalAlpha = 1;
            this.contextBack.strokeStyle = "#8E8E93";
            this.contextBack.fillText(this.wellLooked(axis[i]), this.left + this.padding, this.height - 2 * this.padding - (Math.round(axis[i] - this.min) * this.scaleY));
        }
        this.contextBack.textAlign = "center";
        let prevRight = 0;
        for (let i = 1; i < (this.frame.end - this.frame.start) - 1; i++) {
            let txt = this.dateConvert(this.data.columns[0][this.frame.start + i]);
            let x = this.left + this.padding + Math.round(i * this.scaleX);
            let w = this.contextBack.measureText(txt).width;
            if (prevRight + 2 * this.padding < (x - Math.round(w / 2))
                || prevRight === 0) {
                this.contextBack.fillText(txt, x, this.height + 20);
                prevRight = x + Math.round(w / 2)
            }
        }
    }

    initCanvasForeground() {
        this.canvasFore = document.createElement('canvas');
        this.canvasFore.style.left = this.left + "px";
        this.canvasFore.style.top = this.top + "px";
        this.canvasFore.width  = this.width;
        this.canvasFore.height = this.height;
        this.canvasFore.style.position = "absolute";
        this.canvasFore.style.zIndex = 15;
        this.canvasFore.classList.add("noInvertColor");
        document.getElementById(this.nodeId).appendChild(this.canvasFore);
        this.contextFore = this.canvasFore.getContext("2d");

        this.popup = document.createElement('div');
        this.popup.style.display = 'none';
        this.popup.style.zIndex = 20;
        this.popup.classList.add("popup");
        this.popup.classList.add("noInvertColor");
        document.getElementById(this.nodeId).appendChild(this.popup);
    }

    clearForeground() {
        this.contextFore.clearRect(0, 0, this.width, this.height);
        this.popup.style.display = 'none';
    }

    drawForeground(i, y = 0) {
        this.clearForeground();

        this.contextFore.beginPath();
        this.contextFore.lineWidth = "2";
        this.contextFore.strokeStyle = "#555";
        this.contextFore.moveTo(this.left + this.padding + Math.round(i * this.scaleX), this.top);
        this.contextFore.lineTo(this.left + this.padding + Math.round(i * this.scaleX), this.height);
        this.contextFore.stroke();

        const body = document.getElementsByTagName("body");
        const bgColor = !!body[0].style.backgroundColor ? body[0].style.backgroundColor : "#fff";

        let html = '<b>' + this.dateConvertWeek(this.data.columns[0][this.frame.start + i], true) + '</b>' + '<div class="popupData">';
        for (let j = 1; j < this.data.columns.length; j++) {
            if (this.lineNames.includes(this.data.columns[j][0])) {
                this.contextFore.beginPath();
                this.contextFore.arc(this.left + this.padding + Math.round(i * this.scaleX), this.height - this.padding - (Math.round(this.data.columns[j][this.frame.start + i] - this.min) * this.scaleY), 5, 0, 2 * Math.PI, false);
                this.contextFore.fillStyle = bgColor;
                this.contextFore.fill();
                this.contextFore.lineWidth = "3";
                this.contextFore.strokeStyle = this.data.colors[this.data.columns[j][0]];
                this.contextFore.stroke();
                html += "<div>" + this.data.names[this.data.columns[j][0]] + "</div>" + "<div style='color: " + this.data.colors[this.data.columns[j][0]] + "; text-align:right;'><b>" + this.data.columns[j][this.frame.start + i] + "</b></div>";
            }
        }
        html += "</div>"

        this.popup.innerHTML = html;
        this.popup.style.display = 'block';
        if (this.popup.clientWidth < this.width - (this.left + 5 * this.padding + Math.round(i * this.scaleX))) {
            this.popup.style.left = this.left + 3 * this.padding + Math.round(i * this.scaleX) + "px";
            this.popup.style.right = "";
        } else {
            this.popup.style.right = (this.right + 3 * this.padding - Math.round(i * this.scaleX)) + "px";
            this.popup.style.left = "";
        }
        if (y === 0) {
            this.popup.style.top = this.top + 2 * this.padding + "px";
        } else {
            if (y + this.popup.clientHeight < this.height) {
                this.popup.style.top = y + "px";
            } else {
                this.popup.style.top = y - this.popup.clientHeight + "px";
            }
        }
    }

    getFrame () {
        return this.frame;
    }

    wellLooked(x) {
        if (x > 999 && x < 1000000) {
            if (Math.round(x / 100) !== Math.round(x / 1000) * 10) {
                return (x / 1000).toFixed(1) + 'K'
            } else {
                return Math.round(x / 1000) + 'K'
            }
        } else if (x > 999999) {
            if (Math.round(x / 100000) !== Math.round(x / 1000000) * 10) {
                return (x / 1000000).toFixed(1) + 'M'
            } else {
                return Math.round(x / 1000000) + 'M'
            }
        } else {
            return x;
        }
    }

    axis_numbers(a, b) {
        const least = 4;
        const maximum = 8;
        const deviders = [10, 5, 2, 1];

        const digits = (x) => {
            return x.toString().length
        };

        let minimal = 0;
        let index = 0;
        deviders.forEach((devider, i) => {
            let amount = Math.round((b - a) / (devider * Math.pow(10, (digits(b - a) - 2))));
            if (amount > least) {
                if (minimal > 0) {
                    if (amount < minimal) {
                        minimal = amount;
                        index = i;
                    }
                } else {
                    minimal = amount;
                    index = i;
                }
            }
        });

        let step = deviders[index] * Math.pow(10, (digits(b - a) - 2));

        let start = Math.ceil(a / step) * step;

        let result = [];

        for (let i = 0; i < minimal; i++) {
            result.push(start + i * step);
        }

        while (result.length > maximum) {
            for (let i = 0; i < result.length; i++) {
                result.splice(i + 1, 2);
            }
        }

        return result;
    }

    dateConvert(timestamp) {
        let dt = new Date(timestamp);
        let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        let month = months[dt.getMonth()];
        let date = dt.getDate();
        return date + " " + month
    }

    dateConvertWeek(timestamp, displayYear=false) {
        let dt = new Date(timestamp);
        let days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        let dayOfWeek = days[dt.getDay()]
        let year = dt.getFullYear();
        return dayOfWeek + ", " + this. dateConvert(timestamp) + (displayYear ? " " + year : "");
    }

}
