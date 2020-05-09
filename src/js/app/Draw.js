import Utils from './module/Utils.js';
import Config from './Config.js';
// import TD from './module/TD.js';

// 加载页对象
export default class Draw {
    constructor () {
        this.$canvas = document.querySelector('.canvas');
        this.ctx = this.$canvas.getContext('2d');
        this.touchPoint = {
            x: 0,
            y: 0
        };
        this.imageName = 'pic0';
        this.isInit = false;
        this.color = null;
    }

    show () {
        Utils.fadeIn(this.$page);
    }

    hide () {
        Utils.fadeOut(this.$page);
    }

    init () {
        if (this.isInit === true) {
            return;
        }

        this.bindEvent();
        this.drawImage(this.imageName);
        this.getAreaData(this.imageName);

        this.isInit = true;
    }

    drawImage (name) {
        let image = Config.Preload.buffer.imgs[name + '.jpg'];
        // let image = Config.Preload.buffer.imgs[`${name}_type0_area.png`];
        this.$canvas.width = image.width;
        this.$canvas.height = image.height;

        this.ctx.drawImage(image, 0, 0, image.width, image.height);
    }

    getImageData (image) {
        let canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        let ctx = canvas.getContext('2d');

        ctx.drawImage(image, 0, 0, image.width, image.height);

        // return new Promise((resolve, reject) => {
        //     setTimeout(() => {
        //         let imageData = ctx.getImageData(0, 0, image.width, image.height);
        //         resolve(imageData);
        //     }, 500);
        // });

        return ctx.getImageData(0, 0, image.width, image.height);
    }

    getAreaData (name) {
        let areaImage = Config.Preload.buffer.imgs[`${name}_area.png`];
        // let areaImage = Config.Preload.buffer.imgs[`${name}.jpg`];
        let borderImage = Config.Preload.buffer.imgs[`${name}_border.png`];

        this.areaData = this.getImageData(areaImage);
        this.borderData = this.getImageData(borderImage);

        console.log(this.areaData);
    }

    isSimilar (rgb1, rgb2) {
        let r1 = rgb1.r;
        let g1 = rgb1.g;
        let b1 = rgb1.b;

        let r2 = rgb2.r;
        let g2 = rgb2.g;
        let b2 = rgb2.b;
        let similar = Math.sqrt((r2 - r1) * (r2 - r1) + (g2 - g1) * (g2 - g1) + (b2 - b1) * (b2 - b1));

        console.log('similar:', similar);
    }

    checkPoint (touchPoint) {
        let i = (touchPoint.y * this.areaData.width + touchPoint.x) * 4;
        console.log(touchPoint.x, touchPoint.y);
        let r = this.areaData.data[i];
        let g = this.areaData.data[i + 1];
        let b = this.areaData.data[i + 2];
        let a = this.areaData.data[i + 3];

        let rgba = {
            r: r,
            g: g,
            b: b,
            a: a
        };
        console.log('rgba:', rgba);

        if (r === 0 && g === 0 && b === 255) {
            console.log('蓝色');
            this.drawBorder({ r: 0, g: 0, b: 255 });

            this.color = { r: 0, g: 0, b: 255 };
        } else if (r === 251 && g === 255 && b === 0) {
            console.log('黄色');
            this.drawBorder({ r: 251, g: 255, b: 0 });

            this.color = { r: 0, g: 0, b: 255 };
        } else {
            this.color = { r: 0, g: 0, b: 0 };
        }
    }

    // 比对颜色
    compareColor (rgb1, rgb2) {
        if (rgb1.r === rgb2.r && rgb1.g === rgb2.g && rgb1.b === rgb2.b) {
            return true;
        } else {
            return false;
        }
    }

    getBorder () {
        let initX = this.touchPoint.x;
        let initY = this.touchPoint.y;

        this.borderPointList = [];

        let checkOverList = [];

        const isChecked = (index) => {
            for (let i = 0; i < checkOverList.length; i++) {
                if (index === checkOverList[i]) {
                    return true;
                }
            }

            return false;
        };

        let counter = 0; // 计数器
        let direction = 0; // 螺旋当前方向
        let direction2 = 0; // 扩散方向

        let startTime = new Date().getTime();

        let check = (x, y) => {
            let index = (y * this.areaData.width + x) * 4;

            // 已经检查过
            if (isChecked(index)) {
                return;
            }

            checkOverList.push(index);

            // 超界
            if (x < 0 || y < 0 || x > this.areaData.width - 1 || y > this.areaData.height - 1) {
                return;
            }

            // 到达边界
            if (this.areaData.data[index + 3] === 0) {
                return;
            }

            this.borderPointList.push(index);

            // 扩散式递归
            // check(x - 1, y);
            // check(x, y - 1);
            // check(x + 1, y);
            // check(x, y + 1);

            // 垂直水平轮替递归
            if (direction2 === 0) {
                direction2 = 1;
                check(x - 1, y);
                check(x + 1, y);
            } else {
                direction2 = 0;
                check(x, y - 1);
                check(x, y + 1);
            }

            // 顺时针螺旋式递归
            const circleCheck = () => {
                let nextX;
                let nextY;
                switch (direction) {
                    case 0:
                        // 下一次应当往右
                        nextX = x + 1;
                        nextY = y;
                        break;
                    case 90:
                        // 下一次应当往下
                        nextX = x;
                        nextY = y + 1;
                        break;
                    case 180:
                        // 下一次应当往左
                        nextX = x - 1;
                        nextY = y;
                        break;
                    case 270:
                        // 下一次应当往上
                        nextX = x;
                        nextY = y - 1;
                        break;
                }
                let nextIndex = (nextY * this.areaData.width + nextX) * 4;
                if (isChecked(nextIndex)) {
                    // 撞车，直行
                    switch (direction) {
                        case 0:
                            // 下一次应当往上
                            nextX = x;
                            nextY = y - 1;
                            break;
                        case 90:
                            // 下一次应当往右
                            nextX = x + 1;
                            nextY = y;
                            break;
                        case 180:
                            // 下一次应当往下
                            nextX = x;
                            nextY = y + 1;
                            break;
                        case 270:
                            // 下一次应当往左
                            nextX = x - 1;
                            nextY = y;
                            break;
                    }
                } else {
                    direction += 90;
                    if (direction === 360) direction = 0;
                }
                check(nextX, nextY);
            };

            counter++;
        };

        check(initX, initY);

        let endTime = new Date().getTime();
        let duration = endTime - startTime;
        console.log('总耗时：', duration);
        console.log('执行次数:', counter);
    }

    drawBorder (rgb) {
        let pointList = [];

        // 选取热区
        // for (let i = 0; i < this.areaData.data.length; i += 4) {
        //     let r = this.areaData.data[i];
        //     let g = this.areaData.data[i + 1];
        //     let b = this.areaData.data[i + 2];
        //     // let a = this.areaData.data[i + 3];

        //     if (rgb.r === r && rgb.g === g && rgb.b === b) {
        //         pointList.push(i);
        //     }
        // }

        this.getBorder();

        pointList = this.borderPointList;

        let image = Config.Preload.buffer.imgs[this.imageName + '.jpg'];
        let imageData = this.getImageData(image);

        // 替换像素
        for (let i = 0; i < pointList.length; i++) {
            let index = pointList[i];

            // 判断是否为透明色
            let borderData = this.borderData.data;
            if (borderData[index + 3] !== 0) {
                imageData.data[index] = borderData[index];
                imageData.data[index + 1] = borderData[index + 1];
                imageData.data[index + 2] = borderData[index + 2];
                imageData.data[index + 3] = borderData[index + 3];
            }
        }

        this.ctx.putImageData(imageData, 0, 0);
    }

    bindEvent () {
        this.$canvas.addEventListener('click', (e) => {
            let ratio = this.$canvas.clientWidth / this.$canvas.width;
            this.touchPoint.x = Math.floor(e.clientX / ratio);
            this.touchPoint.y = Math.floor(e.clientY / ratio);
            this.checkPoint(this.touchPoint);
        });
    }
};
