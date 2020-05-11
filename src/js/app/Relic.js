import Utils from './module/Utils.js';
import Config from './Config.js';
// import TD from './module/TD.js';

export default class Relic {
    /**
     * Creates an instance of Relic.
     * @param {string} name 文物名
     * @memberof Relic
     */
    constructor (name) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.image = new Image();
        this.area = new Image();
        this.border = new Image();
        this.pixelIndexList = [];
        this.isInit = false;
        this.name = name;
    }

    show () {
        Utils.fadeIn(this.canvas);
    }

    hide () {
        Utils.fadeOut(this.canvas);
    }

    init () {
        if (this.isInit === true) {
            return;
        }

        this.bindEvent();

        this.isInit = true;
    }

    loadImg () {
        this.image.src = require(`../../img/${this.name}.jpg`);
        this.area.src = require(`../../img/${this.name}_area.png`);
        this.border.src = require(`../../img/${this.name}_border.png`);

        let loadNum = 0;

        return new Promise((resolve, reject) => {
            const onloadHandler = () => {
                loadNum++;
                if (loadNum === 3) {
                    this.isOnload = true;
                    resolve();
                }
            };

            this.image.onload = onloadHandler;
            this.area.onload = onloadHandler;
            this.border.onload = onloadHandler;
        });
    }

    getImageData () {
        this.imageData = Utils.getImageData(this.image);
        this.areaData = Utils.getImageData(this.area);
        this.borderData = Utils.getImageData(this.border);
    }

    /**
     * 绘制边界
     *
     * @param {object} rgb 识别颜色
     * @returns {object} 像素数据
     * @memberof Relic
     */
    drawBorder (rgb) {
        let pixelIndexList = []; // 纹理选区
        let reversePixelIndexList = []; // 反向纹理选区

        this.getImageData();

        // 按颜色选取热区
        for (let i = 0; i < this.areaData.data.length; i += 4) {
            let r = this.areaData.data[i];
            let g = this.areaData.data[i + 1];
            let b = this.areaData.data[i + 2];
            // let a = this.areaData.data[i + 3];

            if (rgb.r === r && rgb.g === g && rgb.b === b) {
                pixelIndexList.push(i);
            } else {
                reversePixelIndexList.push(i);
            }
        }

        this.pixelIndexList = pixelIndexList;

        // 计算点击热区色块范围
        // this.getBorder();
        // pixelIndexList = this.borderPixelIndexList;

        let imageData = this.imageData;

        // 替换像素
        for (let i = 0; i < pixelIndexList.length; i++) {
            let index = pixelIndexList[i];

            // 判断是否为透明色
            let borderData = this.borderData.data;
            if (borderData[index + 3] !== 0) {
                imageData.data[index] = borderData[index];
                imageData.data[index + 1] = borderData[index + 1];
                imageData.data[index + 2] = borderData[index + 2];
                imageData.data[index + 3] = borderData[index + 3];
            }
        }

        // 外围填充黑色
        // for (let i = 0; i < reversePixelIndexList.length; i++) {
        //     let index = reversePixelIndexList[i];

        //     imageData.data[index] = 0;
        //     imageData.data[index + 1] = 0;
        //     imageData.data[index + 2] = 0;
        //     imageData.data[index + 3] = 255;
        // }

        // 压暗周围
        for (let i = 0; i < reversePixelIndexList.length; i++) {
            let index = reversePixelIndexList[i];

            let r = imageData.data[index];
            let g = imageData.data[index + 1];
            let b = imageData.data[index + 2];
            let a = imageData.data[index + 3];

            let Y = Math.round(0.256788 * r + 0.504129 * g + 0.097906 * b) + 16;
            let U = Math.round(-0.148223 * r - 0.290993 * g + 0.439216 * b) + 128;
            let V = Math.round(0.439216 * r - 0.367788 * g - 0.071427 * b) + 128;

            Y -= 80;
            if (Y < 0) Y = 0;
            r = Math.round((Y - 16) + 1.140 * (V - 128));
            g = Math.round((Y - 16) - 0.394 * (U - 128) - 0.581 * (V - 128));
            b = Math.round((Y - 16) + 2.032 * (U - 128));
            // a = 255;

            imageData.data[index] = r;
            imageData.data[index + 1] = g;
            imageData.data[index + 2] = b;
            // imageData.data[index + 3] = a;
        }

        return imageData;
    }

    bindEvent () {
    }
};
