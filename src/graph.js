import Container from './container.js'
import Pie from './pie.js'
import { colors } from './colors.js'
import { wellLooked, wellLookedSpaces, dateConvert } from './helper.js'

export default class Graph extends Container {

    constructor(position, nodeId, data, config, onPopupClick) {
        position.bottom = position.bottom - 30;
        super(position, nodeId, data, config);
        this.onPopupClick = onPopupClick;

        this.initCanvasBackground();
        this.initCanvasForeground();

        if (!this.config.pie) {
            this.canvasFore.onmousedown = (e) => {
                let x = e.x - this.canvasFore.getBoundingClientRect().x;
                let y = e.y - this.canvasFore.getBoundingClientRect().y;
                if (Math.round(x / this.scaleX) >= 0 && Math.round(x / this.scaleX) < (this.frame.end - this.frame.start)) {
                    this.drawForeground(x, y)
                }
            };
        } else {
            this.pie = new Pie(this.nodeId, this.canvasFore, this.padding, this.data.columns.length - 1);
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
        this.setTextInterval();
        this.contextBack.globalAlpha = 1.0;
        for (let yAxis = 0; yAxis < this.yAxisCount; yAxis++) {
            let axis = !!this.axisScale[yAxis] ? this.axisScale[yAxis] : this.axis_numbers(this.getMin(yAxis), this.getMax(yAxis));
            this.contextBack.beginPath();
            this.contextBack.lineWidth = "1";
            this.contextBack.textAlign = "left";
            this.contextBack.font = "12px Arial";
            for (let i = 0; i < axis.length; i++) {
                if (yAxis === 0) {
                    this.contextBack.strokeStyle = colors[this.theme].gridLines;
                    this.contextBack.globalAlpha = colors[this.theme].gridLinesOpacity;
                    this.contextBack.beginPath();
                    this.contextBack.moveTo(this.left + this.padding, this.height - this.padding - (Math.round(axis[i] - this.getMin(yAxis)) * this.getScaleY(yAxis)));
                    this.contextBack.lineTo(this.left + this.width - this.padding, this.height - this.padding - (Math.round(axis[i] - this.getMin(yAxis)) * this.getScaleY(yAxis)));
                    this.contextBack.stroke();
                    this.contextBack.globalAlpha = 1;
                }
                if (this.yAxisCount === 1) {
                    if (!this.data.stacked) {
                        this.contextBack.fillStyle = colors[this.theme].axisTextV1;
                        this.contextBack.globalAlpha = colors[this.theme].axisTextV1Opacity;
                    } else {
                        this.contextBack.fillStyle = colors[this.theme].axisTextV2Y;
                        this.contextBack.globalAlpha = colors[this.theme].axisTextV2YOpacity;
                    }
                } else {
                    this.contextBack.fillStyle = this.data.colors[this.lineNames[yAxis]];
                }
                if (this.lineNames.includes(this.data.columns[yAxis+1][0]) || this.yAxisCount === 1) {
                    let x;
                    if (yAxis % 2 === 0) {
                        this.contextBack.textAlign = 'left';
                        x = this.left + this.padding + yAxis * 5 * this.padding;
                    } else {
                        this.contextBack.textAlign = 'right';
                        x = this.right - this.padding - ((yAxis - 1) * 5 * this.padding);
                    }
                    this.contextBack.fillText(wellLooked(axis[i]), x, this.height - 2 * this.padding - (Math.round(axis[i] - this.getMin(yAxis)) * this.getScaleY(yAxis)));
                }
            }
        }
        this.contextBack.textAlign = "center";
        if (!this.data.stacked) {
            this.contextBack.fillStyle = colors[this.theme].axisTextV1;
            this.contextBack.globalAlpha = colors[this.theme].axisTextV1Opacity;
        } else {
            this.contextBack.fillStyle = colors[this.theme].axisTextV2X;
            this.contextBack.globalAlpha = colors[this.theme].axisTextV2XOpacity;
        }
        let prevRight = 0;
        let format = dateConvert(this.data.columns[0][this.frame.start + 1]) === dateConvert(this.data.columns[0][this.frame.end - 2]) ? '&h:&i' : '&d &m';
        for (let i = 1; i < (this.frame.end - this.frame.start) - 1; i++) {
            let txt = dateConvert(this.data.columns[0][this.frame.start + i], format);
            let x = this.left + this.padding + Math.round(i * this.scaleX);
            let w = this.contextBack.measureText(txt).width;
            if (prevRight + 2 * this.padding < (x - Math.round(w / 2))
                || prevRight === 0) {
                this.contextBack.fillText(txt, x, this.height + 20);
                prevRight = x + Math.round(w / 2)
            }
        }
    }

    setTextInterval() {
        let txt = document.getElementById(this.nodeId + "-text-interval");
        let start = dateConvert(this.data.columns[0][this.frame.start], "&d &M &Y");
        let end = dateConvert(this.data.columns[0][this.frame.end - 1], "&d &M &Y");
        if (start !== end) {
            txt.textContent = dateConvert(start, "&d &M &Y") + " - " + dateConvert(end, "&d &M &Y");
        } else {
            txt.textContent = dateConvert(start, "&W, &d &M &Y");
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
        document.getElementById(this.nodeId).appendChild(this.canvasFore);
        this.contextFore = this.canvasFore.getContext("2d");

        this.popup = document.createElement('div');
        this.popup.style.display = 'none';
        this.popup.style.zIndex = 20;
        this.popup.classList.add("popup");
        this.popup.setAttribute("id", this.nodeId + "-popup");
        document.getElementById(this.nodeId).appendChild(this.popup);
    }

    clearForeground() {
        this.contextFore.clearRect(0, 0, this.width, this.height);
        this.popup.style.display = 'none';
    }

    drawForeground(mX = 0, mY = 0) {

        this.popup.style.backgroundColor = colors[this.theme].tooltipBackground;
        this.popup.style.borderColor = colors[this.theme].tooltipBorder;

        if (mX === 0 ) return;

        let i = Math.round((mX - (this.left + this.padding)) / this.scaleX)
        this.clearForeground();

        if (this.data.types.y0 === 'line' || this.data.types.y0 === 'area') {

            this.contextFore.beginPath();
            this.contextFore.lineWidth = "1";
            this.contextFore.strokeStyle = "#182D3B";
            this.contextFore.globalAlpha = 0.1;
            this.contextFore.moveTo(this.left + this.padding + Math.round(i * this.scaleX), this.top);
            this.contextFore.lineTo(this.left + this.padding + Math.round(i * this.scaleX), this.height);
            this.contextFore.stroke();

        } else if (this.data.types.y0 === 'bar') {

            this.contextFore.fillStyle = colors[this.theme].lightenMask;
            this.contextFore.globalAlpha = colors[this.theme].lightenMaskOpacity;
            this.contextFore.beginPath();

            let n = 0;
            while (!!this.barsX[n] && mX > this.barsX[n].x) n++;

            if (!!this.barsX[n-1].x) {
                let l = this.barsX[n - 1].x - this.left - this.padding;
                i = this.barsX[n - 1].i - this.frame.start;
                this.contextFore.rect(this.left + this.padding, this.padding, l, this.height - this.padding);
                this.contextFore.fill();
                this.contextFore.beginPath();
            }

            if (!!this.barsX[n]) {
                let r = this.barsX[n].x;
                this.contextFore.rect(r, this.padding, this.width - this.padding - r, this.height - this.padding);
                this.contextFore.fill();
            }
        }

        this.contextFore.globalAlpha = 1;

        const body = document.getElementsByTagName("body");
        const bgColor = !!body[0].style.backgroundColor ? body[0].style.backgroundColor : "#fff";

        if (this.data.columns[0][this.frame.start + i] === undefined) return;
        let header = dateConvert(this.data.columns[0][this.frame.start + i], '&w, &d &m &Y');
        header = header.replace(/\s/g, "&nbsp;");
        let html = '<div class="popupData"><div class="popupHeader"><b>' + header + '</b>' + '</div>';
        if (!this.config.zoomed) {
            html += '<div class="arrow" style="color:' + colors[this.theme].toolTipArrow + '">&rsaquo;</div>';
        } else {
            html += '<div></div>';
        }
        let total = 0; let perc = 0;
        for (let j = 1; j < this.data.columns.length; j++) {
            let name = this.data.columns[j][0];
            if (this.lineNames.includes(name)) {

                if (this.data.types[name] === 'line') {
                    this.contextFore.beginPath();
                    this.contextFore.arc(this.left + this.padding + Math.round(i * this.scaleX), this.height - this.padding - (Math.round(this.data.columns[j][this.frame.start + i] - this.getMin(j-1)) * this.getScaleY(j-1)), 5, 0, 2 * Math.PI, false);
                    this.contextFore.fillStyle = bgColor;
                    this.contextFore.fill();
                    this.contextFore.lineWidth = "3";
                    this.contextFore.strokeStyle = this.data.colors[this.data.columns[j][0]];
                    this.contextFore.stroke();
                    html += "<div class='popupHeader'>" + this.data.names[this.data.columns[j][0]] + "</div>" + "<div style='color: " + this.data.colors[this.data.columns[j][0]] + "; text-align:right;'><b>" + wellLookedSpaces(this.data.columns[j][this.frame.start + i]) + "</b></div>";
                }

                if (this.data.types[name] === 'bar') {
                    html += "<div class='popupHeader'>" + this.data.names[this.data.columns[j][0]] + "</div>" + "<div style='color: " + this.data.colors[this.data.columns[j][0]] + "; text-align:right;'><b>" + wellLookedSpaces(this.data.columns[j][this.frame.start + i]) + "</b></div>";
                    if (this.data.stacked) total += this.data.columns[j][this.frame.start + i];
                }

                if (this.data.percentage) {
                    const sum = (k) => {
                        let result = 0;
                        for (let i = 1; i < this.data.columns.length; i++) {
                            if (this.lineNames.includes(this.data.columns[i][0])) result += this.data.columns[i][k]
                        }
                        return result
                    };

                    if (this.lineNames[this.lineNames.length - 1] !== name) {
                        perc = Math.round(this.data.columns[j][this.frame.start + i] * 100 / sum(this.frame.start + i));
                        total += perc;
                    } else {
                        perc = 100 - total;
                    }

                    html += "<div style='text-align: right;padding-right: 5px'><b>" + perc + "%</b></div><div>" + this.data.names[name] + "</div>" + "<div style='color: " + this.data.colors[this.data.columns[j][0]] + "; text-align:right;'><b>" + this.data.columns[j][this.frame.start + i] + "</b></div>";
                }

            }
        }
        if (this.data.stacked && !this.data.percentage) html += "<div class='popupHeader'>All</div><div style='text-align:right;'><b>" + wellLookedSpaces(total) + "</b></div>";
        html += "</div>"

        this.popup.innerHTML = html;
        this.popup.style.display = 'block';
        if (!this.config.zoomed) this.popup.onclick = this.onPopupClick(this.data.columns[0][this.frame.start + i]);
        let pX = this.left + Math.round(i * this.scaleX / 2);
        if (pX < this.left) pX = 0;
        if (pX + this.popup.clientWidth > this.left + this.width) pX = this.left + this.width - this.popup.clientWidth;
        this.popup.style.left = pX + "px";
        if (mY === 0) {
            this.popup.style.top = this.top + 2 * this.padding + "px";
        } else {
            if ((mY + Math.round(this.popup.clientHeight/2)) > this.height) {
                this.popup.style.top = this.top + 2 * this.padding + "px";
            } else {
                this.popup.style.top = mY + 2 * this.padding + "px";
            }
        }
    }

    getFrame () {
        return this.frame;
    }

}
