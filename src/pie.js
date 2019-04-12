export default class Pie {

    constructor(canvas, padding){
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.padding = padding;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centerX = Math.round(this.width/2);
        this.centerY = Math.round(this.height/2);
        this.maxR = this.width > this.height ? (this.centerY - this.padding) : (this.centerX - this.padding);
        this.stepForward = Math.round(this.maxR*0.1);
    }

    draw(data) {

        let total = 0;
        for (let i=0; i < data.length; i++) total += data[i].value;

        let sum = 0;
        for (let i=0; i < data.length; i++) {
            if ((i+1) < data.length) {
                data[i].perc = Math.round(100 * data[i].value / total);
                sum += data[i].perc;
            } else {
                data[i].perc = 100 - sum;
            }
        }

        const R = this.maxR - this.stepForward;

        let angle1 = 0;
        let angle2 = 0;
        for (let i=0; i < data.length; i++) {
            angle2 = 2 * Math.PI * data[i].value/total + angle1;
            this.context.fillStyle = data[i].color;
            this.context.beginPath();
            this.context.moveTo(this.centerX, this.centerY);
            this.context.lineTo(this.centerX + R * Math.cos(angle1), this.centerY + R * Math.sin(angle1));
            this.context.arc(this.centerX, this.centerY, R, angle1, angle2, false);
            this.context.fill();
            this.context.closePath();
            angle1 = angle2;
        }
        this.context.textAlign = "center";
        this.context.textBaseline = 'middle';
        this.context.fillStyle = "#FFFFFF";
        if (data.length > 1) {
            for (let i = 0; i < data.length; i++) {
                if (data[i].perc < 3) {
                    this.context.font = "1vh Arial"
                } else if (data[i].perc >= 3 && data[i].perc < 5) {
                    this.context.font = "2vh Arial"
                } else if (data[i].perc >= 5 && data[i].perc < 20) {
                    this.context.font = "3vh Arial"
                } else {
                    this.context.font = "5vh Arial"
                }

                angle2 = 2 * Math.PI * data[i].value / total + angle1;
                this.context.fillText(data[i].perc + '%', this.centerX + 0.6 * R * Math.cos(angle1 + (angle2 - angle1) / 2), this.centerY + 0.6 * R * Math.sin(angle1 + (angle2 - angle1) / 2));
                angle1 = angle2;
            }
        } else {
            if (data.length > 0) {
                this.context.font = "7vh Arial"
                this.context.fillText('100%', this.centerX, this.centerY);
            }
        }


    }

}