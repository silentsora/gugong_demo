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
        this.ZOOMRATIO = 1.4;
        this.DURATION = 800;
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
                    this.getImageData();
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

                // 替换成黄色边缘
                // imageData.data[index] = 251;
                // imageData.data[index + 1] = 255;
                // imageData.data[index + 2] = 0;
                // imageData.data[index + 3] = borderData[index + 3];
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

            Y -= 100;
            if (Y < 0) Y = 0;
            r = Math.round((Y - 16) + 1.140 * (V - 128));
            g = Math.round((Y - 16) - 0.394 * (U - 128) - 0.581 * (V - 128));
            b = Math.round((Y - 16) + 2.032 * (U - 128));
            // a = 255;

            imageData.data[index] = r;
            imageData.data[index + 1] = g;
            imageData.data[index + 2] = b;
            imageData.data[index + 3] = a;
        }

        return imageData;
    }

    getDefaultState () {
        let data = this.borderData;
        for (let i = 0; i < data.data.length; i += 4) {
            let r = data.data[i];
            let g = data.data[i + 1];
            let b = data.data[i + 2];
            let a = data.data[i + 3];

            if (a !== 0) {
                data.data[i] = 251;
                data.data[i + 1] = 255;
                data.data[i + 2] = 0;
                // data.data[i + 3] = 255;
                // data.data[i + 3] = data.data[i + 3];
            } else {
                data.data[i] = this.imageData.data[i];
                data.data[i + 1] = this.imageData.data[i + 1];
                data.data[i + 2] = this.imageData.data[i + 2];
                data.data[i + 3] = this.imageData.data[i + 3];
            }
        }

        return data;
    }

    /**
     * 计算纹样中心点
     *
     * @param {array} pixelIndexList 纹样对应像素数据索引
     * @param {number} width 画布宽度
     * @returns {object} 纹样中心点和纹样宽高
     * @memberof Relic
     */
    calculateCenter (pixelIndexList, width) {
        let minX, minY, maxX, maxY;

        for (let i = 0; i < pixelIndexList.length; i++) {
            let index = pixelIndexList[i];
            let x = (index / 4) % width;
            let y = Math.floor((index / 4) / width);

            if (i === 0) {
                minX = maxX = x;
                minY = maxY = y;
            }

            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }

        console.log(`minX:${minX}, maxX:${maxX}, minY:${minY}, maxY:${maxY}`);

        let centerX = Math.floor((minX + maxX) / 2);
        let centerY = Math.floor((minY + maxY) / 2);

        console.log(`centerX: ${centerX}, centerY: ${centerY}`);

        return { x: centerX, y: centerY, width: maxX - minX, height: maxY - minY };
    }

    zoomIn (canvas, duration = this.DURATION) {
        let centerPoint = this.calculateCenter(this.pixelIndexList, this.areaData.width);

        console.log(centerPoint);

        let initPoint = {
            x: this.areaData.width / 2,
            y: this.areaData.height / 2
        };

        let scaleX = this.imageData.width / centerPoint.width / this.ZOOMRATIO;
        let scaleY = this.imageData.height / centerPoint.height / this.ZOOMRATIO;
        let scale = scaleX > scaleY ? scaleY : scaleX;
        if (scale < 1) scale = 1;

        this.ratio = canvas.clientWidth / this.imageData.width;

        let moveX = Math.floor((initPoint.x - centerPoint.x) * this.ratio * scale);
        let moveY = Math.floor((initPoint.y - centerPoint.y) * this.ratio * scale);

        // 位移太小不如不移动
        console.log(`moveX: ${moveX}, moveY: ${moveY}`);
        if (Math.abs(moveX) < 10 && Math.abs(moveY) < 10) {
            moveX = 0;
            moveY = 0;
        }

        console.log(scale);

        duration /= 1000;
        TweenMax.to(canvas, duration, {
            x: moveX - this.areaData.width / 2 * this.ratio,
            y: moveY - this.areaData.height / 2 * this.ratio,
            scale: scale
        });

        setTimeout(() => {
            TweenMax.to(canvas, this.DURATION / 1000, {
                x: -this.areaData.width / 2 * this.ratio,
                y: -this.areaData.height / 2 * this.ratio,
                scale: 1
            });
        }, this.DURATION + 300);
    }

    zoomOut (canvas, duration = this.DURATION) {
        duration /= 1000;
        TweenMax.to(canvas, duration, {
            x: 0,
            y: 0,
            scale: 1
        });
    }

    bindEvent () {
    }
};
