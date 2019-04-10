import Container from './container.js'

export default class Graph extends Container {

    constructor(position, nodeId, data) {
        position.bottom = position.bottom - 30;
        super(position, nodeId, data);

        this.initCanvasBackground();
        this.initCanvasForeground();

        this.canvasFore.onmousedown = (e) => {
            let x = e.x - this.canvasFore.getBoundingClientRect().x;
            let y = e.y - this.canvasFore.getBoundingClientRect().y;
            if (Math.round(x / this.scaleX) >= 0 && Math.round(x / this.scaleX) < (this.frame.end - this.frame.start)) {
                this.drawForeground(Math.round(x / this.scaleX), y)
            }
        };
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
        this.canvasBack.style.zIndex = 12;
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
        for (let yAxis = 0; yAxis < this.yAxisCount; yAxis++) {
            let axis = this.axis_numbers(this.getMin(yAxis), this.getMax(yAxis));
            this.contextBack.beginPath();
            this.contextBack.lineWidth = "1";
            this.contextBack.textAlign = "left";
            this.contextBack.font = "12px Arial";
            for (let i = 0; i < axis.length; i++) {
                if (yAxis === 0) {
                    this.contextBack.strokeStyle = "#182D3B";
                    this.contextBack.globalAlpha = 0.1;
                    this.contextBack.beginPath();
                    this.contextBack.moveTo(this.left + this.padding, this.height - this.padding - (Math.round(axis[i] - this.getMin(yAxis)) * this.getScaleY(yAxis)));
                    this.contextBack.lineTo(this.left + this.width - this.padding, this.height - this.padding - (Math.round(axis[i] - this.getMin(yAxis)) * this.getScaleY(yAxis)));
                    this.contextBack.stroke();
                    this.contextBack.globalAlpha = 1;
                }
                if (this.yAxisCount === 1) {
                    if (!this.data.percentage) {
                        this.contextBack.fillStyle = "#8E8E93";
                    } else {
                        this.contextBack.fillStyle = "#252529";
                        this.contextBack.globalAlpha = 0.5;
                    }
                } else {
                    this.contextBack.fillStyle = this.data.colors[this.lineNames[yAxis]];
                }
                if (this.lineNames.includes(this.data.columns[yAxis+1][0]) || this.yAxisCount == 1) {
                    let x;
                    if (yAxis % 2 === 0) {
                        this.contextBack.textAlign = 'left';
                        x = this.left + this.padding + yAxis * 5 * this.padding;
                    } else {
                        this.contextBack.textAlign = 'right';
                        x = this.right - this.padding - ((yAxis - 1) * 5 * this.padding);
                    }
                    this.contextBack.fillText(this.wellLooked(axis[i]), x, this.height - 2 * this.padding - (Math.round(axis[i] - this.getMin(yAxis)) * this.getScaleY(yAxis)));
                }
            }
        }
        this.contextBack.textAlign = "center";
        this.contextBack.fillStyle = "#8E8E93";
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
        this.contextFore.lineWidth = "1";
        this.contextFore.strokeStyle = "#182D3B";
        this.contextFore.globalAlpha = 0.1;
        this.contextFore.moveTo(this.left + this.padding + Math.round(i * this.scaleX), this.top);
        this.contextFore.lineTo(this.left + this.padding + Math.round(i * this.scaleX), this.height);
        this.contextFore.stroke();
        this.contextFore.globalAlpha = 1;

        const body = document.getElementsByTagName("body");
        const bgColor = !!body[0].style.backgroundColor ? body[0].style.backgroundColor : "#fff";

        let header = this.dateConvertWeek(this.data.columns[0][this.frame.start + i], true);
        header = header.replace(/\s/g, "&nbsp;");
        let html = '<div class="popupData"><div class="popupHeader"><b>' + header + '</b>' + '</div><div class="arrow">&rsaquo;</div>';
        let total = 0; let perc = 0;
        for (let j = 1; j < this.data.columns.length; j++) {
            let name = this.data.columns[j][0];
            if (this.lineNames.includes(name)) {
                if (this.data.types[name] === 'line') {
                    this.contextFore.beginPath();
                    this.contextFore.arc(this.left + this.padding + Math.round(i * this.scaleX), this.height - this.padding - (Math.round(this.data.columns[j][this.frame.start + i] - this.min) * this.getScaleY(1)), 5, 0, 2 * Math.PI, false);
                    this.contextFore.fillStyle = bgColor;
                    this.contextFore.fill();
                    this.contextFore.lineWidth = "3";
                    this.contextFore.strokeStyle = this.data.colors[this.data.columns[j][0]];
                    this.contextFore.stroke();
                    html += "<div class='popupHeader'>" + this.data.names[this.data.columns[j][0]] + "</div>" + "<div style='color: " + this.data.colors[this.data.columns[j][0]] + "; text-align:right;'><b>" + this.data.columns[j][this.frame.start + i] + "</b></div>";
                }
                if (this.data.percentage) {
                    const sum = (k) => {
                        let result = 0;
                        for (let i = 1; i < this.data.columns.length; i++) {
                            if (this.lineNames.includes(this.data.columns[i][0])) result += this.data.columns[i][k]
                        }
                        return result
                    };

                    if (this.lineNames[this.lineNames.length] !== name) {
                        perc = Math.round(this.data.columns[j][this.frame.start + i] * 100 / sum(this.frame.start + i));
                        total += perc;
                    } else {
                        perc = 100 - total;
                    }

                    html += "<div style='text-align: right;padding-right: 5px'><b>" + perc + "%</b></div><div>" + this.data.names[name] + "</div>" + "<div style='color: " + this.data.colors[this.data.columns[j][0]] + "; text-align:right;'><b>" + this.data.columns[j][this.frame.start + i] + "</b></div>";
                }
            }
        }
        html += "</div>"

        this.popup.innerHTML = html;
        this.popup.style.display = 'block';
        let pX = this.left + Math.round(i * this.scaleX / 2);
        if (pX < this.left) pX = 0;
        if (pX + this.popup.clientWidth > this.left + this.width) pX = this.left + this.width - this.popup.clientWidth;
        this.popup.style.left = pX + "px";
        if (y === 0) {
            this.popup.style.top = this.top + 2 * this.padding + "px";
        } else {
            this.popup.style.top = y - Math.round(this.popup.clientHeight/2) + "px";
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
        return dayOfWeek + ", " + this.dateConvert(timestamp) + (displayYear ? " " + year : "");
    }

}
