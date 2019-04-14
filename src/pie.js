import { wellLookedSpaces } from './helper.js'

export default class Pie {

    constructor(nodeId, canvas, padding, maxColumns) {
        this.nodeId = nodeId;
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.padding = padding;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centerX = Math.round(this.width/2);
        this.centerY = Math.round(this.height/2);
        this.maxR = this.width > this.height ? (this.centerY - this.padding) : (this.centerX - this.padding);
        this.stepForward = Math.round(this.maxR*0.1);
        this.R = this.maxR - this.stepForward;
        this.aR = 0;
        this.aAngle = 0;
        this.aValue = [];
        for (let i=0; i < maxColumns; i++) this.aValue.push(0);
        this.angles = [];
        for (let i=0; i < maxColumns; i++) this.angles.push({angle1: 0, angle2: 0});
        this.maxColumns = maxColumns;
        this.selectedSector = -1;
        this.popup = document.getElementById(this.nodeId + '-popup');
        this.popup.style.display = 'none';

        this.canvas.onmousedown = (e) => {
            let x = e.x - this.canvas.getBoundingClientRect().x;
            let y = e.y - this.canvas.getBoundingClientRect().y;
            this.selectSector(x, y);
        };

    }

    draw(data, callback) {
        for (let i=0; i < this.maxColumns; i++) {
            if (!data[i]) {
                data[i] = {};
                data[i].value = 0;
                data[i].name = '';
                data[i].color = '';
            }
            data[i].step = 0;
        }
        this.data = data;

        this.drawPie(data, this.R);

        let request = false;

        if (this.aR < this.R) {
            this.aR = Math.ceil(this.aR + (this.R - this.aR) / 3);
            this.aAngle = this.aAngle + Math.PI/45;
            request = true;
        } else {
            this.aR = this.R;
        }

        for (let i=0; i < data.length; i++) {
            if (this.aValue[i] < 0.99 * data[i].value) {
                this.aValue[i] = Math.ceil(this.aValue[i] + (data[i].value - this.aValue[i]) / 10);
                request = true;
            } else if (this.aValue[i] > 1.01 * data[i].value) {
                this.aValue[i] = Math.floor(this.aValue[i] - (this.aValue[i] - data[i].value) / 10);
                request = true;
            } else if (this.aValue[i] !== data[i].value) {
                this.aValue[i] = data[i].value;
                request = true;
            }
        }

        if (request) requestAnimationFrame(callback);

        if (!request && !!this.delayedSelect) {
            this.selectSector(this.delayedSelect.x, this.delayedSelect.y);
        }
    }

    drawPie(data, fR) {
        this.context.clearRect(0, 0, this.width, this.height);
        if (this.aR > fR) this.aR = fR;
        let total = 0;
        for (let i=0; i < data.length; i++) total += this.aValue[i];
        if (!total) return;

        let sum = 0;
        for (let i=0; i < data.length; i++) {
            if ((i+1) < data.length) {
                data[i].perc = Math.round(100 * this.aValue[i] / total);
                sum += data[i].perc;
            } else {
                data[i].perc = 100 - sum;
            }
        }

        let angle1 = this.aAngle;
        let angle2 = this.aAngle;
        for (let i=0; i < data.length; i++) {
            angle2 = 2 * Math.PI * this.aValue[i]/total + angle1;
            if (!!data[i].color) {
                this.drawSector(this.centerX, this.centerY, this.aR, angle1, angle2, data[i].color);
            }
            this.angles[i] = {angle1: angle1 % (2*Math.PI), angle2: angle2 % (2*Math.PI), oAngle1: angle1, oAngle2: angle2}
            angle1 = angle2;
        }

        if (this.aR === fR) {
            if (!data.some(item => { return item.perc === 100 })) {
                for (let i = 0; i < data.length; i++) {
                    angle2 = 2 * Math.PI * this.data[i].value / total + angle1;
                    this.outText(i, this.centerX + 0.6 * this.aR * Math.cos(angle1 + (angle2 - angle1) / 2), this.centerY + 0.6 * this.aR * Math.sin(angle1 + (angle2 - angle1) / 2))
                    angle1 = angle2;
                }
            } else {
                this.context.textAlign = "center";
                this.context.textBaseline = 'middle';
                this.context.fillStyle = "#FFFFFF";
                this.context.font = "7vh Arial"
                this.context.fillText('100%', this.centerX, this.centerY);
            }
        }
    }

    outText(i, x, y) {
        this.context.textAlign = "center";
        this.context.textBaseline = 'middle';
        this.context.fillStyle = "#FFFFFF";
        if (this.data[i].perc > 0 && !!this.data[i].color) {
            if (this.data[i].perc < 3) {
                this.context.font = "1vh Arial"
            } else if (this.data[i].perc >= 3 && this.data[i].perc < 8) {
                this.context.font = "2vh Arial"
            } else if (this.data[i].perc >= 8 && this.data[i].perc < 20) {
                this.context.font = "3vh Arial"
            } else {
                this.context.font = "5vh Arial"
            }
            this.context.fillText(this.data[i].perc + '%', x, y);
        }
    }

    drawSector(x, y, R, angle1, angle2, fillcolor) {
        this.context.fillStyle = fillcolor;
        this.context.beginPath();
        this.context.moveTo(x, y);
        this.context.lineTo(x + R * Math.cos(angle1), y + R * Math.sin(angle1));
        this.context.arc(x, y, R, angle1, angle2, false);
        this.context.fill();
        this.context.closePath();
    }

    selectSector(x, y) {
        this.delayedSelect = undefined;
        if (this.aValue.every((item, i) => { return item === this.data[i].value })) {
            if (this.selectedSector >= 0) {
                let i = this.selectedSector;
                const animateSector = () => {
                    requestAnimationFrame(() => {
                        this.context.clearRect(0, 0, this.width, this.height);
                        this.data[i].step -= 1;
                        this.drawSector(this.centerX + this.data[i].step * Math.cos((this.angles[i].oAngle2 + this.angles[i].oAngle1)/2),
                                        this.centerY + this.data[i].step * Math.sin((this.angles[i].oAngle2 + this.angles[i].oAngle1)/2),
                                        this.R, this.angles[i].angle1, this.angles[i].angle2,
                                        this.data[i].color);
                        this.outText(i, this.centerX + (0.6 * this.R + this.data[i].step) * Math.cos((this.angles[i].oAngle2 + this.angles[i].oAngle1)/2),
                                        this.centerY + (0.6 * this.R + this.data[i].step) * Math.sin((this.angles[i].oAngle2 + this.angles[i].oAngle1)/2));
                        for (let j=0; j < this.maxColumns; j++) {
                            if (i !== j) {
                                this.drawSector(this.centerX + this.data[j].step * Math.cos((this.angles[j].oAngle2 + this.angles[j].oAngle1)/2),
                                                this.centerY + this.data[j].step * Math.sin((this.angles[j].oAngle2 + this.angles[j].oAngle1)/2),
                                                this.R, this.angles[j].angle1, this.angles[j].angle2, this.data[j].color);
                                this.outText(j, this.centerX + (0.6 * this.R + this.data[j].step) * Math.cos((this.angles[j].oAngle2 + this.angles[j].oAngle1)/2),
                                                this.centerY + (0.6 * this.R + this.data[j].step) * Math.sin((this.angles[j].oAngle2 + this.angles[j].oAngle1)/2));
                            }
                        }
                        if (this.data[i].step > 0) animateSector();
                    })
                };
                animateSector();
            }
            if (this.distanceToCenter(x, y) < this.maxR - this.stepForward) {
                let rad = Math.atan2(y - this.centerY, x - this.centerX);
                rad = rad < 0 ? 2 * Math.PI + rad : rad;
                for (let i=0; i < this.angles.length; i++) {
                    if ( rad > this.angles[i].angle1 && rad < this.angles[i].angle2
                        ||  (this.angles[i].angle1 > this.angles[i].angle2
                                && ( (rad > this.angles[i].angle1 && rad < 2*Math.PI)
                                     || (rad > 0 && rad < this.angles[i].angle2)
                                   )
                            )
                        ) {
                            if (this.selectedSector !== i) {
                                this.selectedSector = i;
                                const animateSector = () => {
                                    requestAnimationFrame(() => {
                                        this.context.clearRect(0, 0, this.width, this.height);
                                        this.data[i].step += 1;
                                        this.drawSector(this.centerX + this.data[i].step * Math.cos((this.angles[i].oAngle2 + this.angles[i].oAngle1)/2),
                                                        this.centerY + this.data[i].step * Math.sin((this.angles[i].oAngle2 + this.angles[i].oAngle1)/2),
                                                        this.R, this.angles[i].angle1, this.angles[i].angle2,
                                                        this.data[i].color);
                                        this.outText(i, this.centerX + (0.6 * this.R + this.data[i].step) * Math.cos((this.angles[i].oAngle2 + this.angles[i].oAngle1)/2),
                                                        this.centerY + (0.6 * this.R + this.data[i].step) * Math.sin((this.angles[i].oAngle2 + this.angles[i].oAngle1)/2));
                                        for (let j=0; j < this.maxColumns; j++) {
                                            if (i !== j) {
                                                this.drawSector(this.centerX + this.data[j].step * Math.cos((this.angles[j].oAngle2 + this.angles[j].oAngle1)/2),
                                                                this.centerY + this.data[j].step * Math.sin((this.angles[j].oAngle2 + this.angles[j].oAngle1)/2),
                                                                this.R, this.angles[j].angle1, this.angles[j].angle2, this.data[j].color);
                                                this.outText(j, this.centerX + (0.6 * this.R + this.data[j].step) * Math.cos((this.angles[j].oAngle2 + this.angles[j].oAngle1)/2),
                                                                this.centerY + (0.6 * this.R + this.data[j].step) * Math.sin((this.angles[j].oAngle2 + this.angles[j].oAngle1)/2));
                                            }
                                        }
                                        if (this.data[i].step < this.stepForward) animateSector();
                                    })
                                };
                                animateSector();
                                this.popupShow(true, i, x, y);
                            } else {
                                this.selectedSector = -1;
                            }
                          }
                }
            } else {
                this.selectedSector = -1;
            }
        } else {
            for (let i=0; i < this.aValue.length; i++) {
                this.aValue[i] = this.data[i].value;
                this.delayedSelect = {x, y};
            }
        }
    }

    popupShow(visible, i, x, y) {
        if (visible) {
            let html = '<div class="popupData"><div class="popupHeader">' + this.data[i].name + '</div><div style="color:' + this.data[i].color + '">' + wellLookedSpaces(this.data[i].value) + '</div></div>';
            this.popup.innerHTML = html;
            this.popup.style.display = 'block';
            let pX = x;
            if (pX < this.left) pX = 0;
            if (pX + this.popup.clientWidth > this.width) pX = this.width - this.popup.clientWidth;
            this.popup.style.left = pX + "px";
            let mY = y;
            if ((mY + Math.round(this.popup.clientHeight/2)) > this.height) {
                this.popup.style.top = this.top + 2 * this.padding + "px";
            } else {
                this.popup.style.top = mY + 2 * this.padding + "px";
            }

        } else {
            this.popup.style.display = 'none';
        }
    }

    distanceToCenter(x1, y1) {
        return this.distance(x1, y1, this.centerX, this.centerY);
    }

    distance(x1, y1, x2, y2){
        return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
    }

}
