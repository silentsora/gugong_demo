import Utils from './module/Utils.js';
import Config from './Config.js';
// import TD from './module/TD.js';
import Relic from './Relic.js';

// 加载页对象
export default class Draw {
    constructor () {
        this.$canvasBack = document.querySelector('.canvas-back');
        this.ctxBack = this.$canvasBack.getContext('2d');
        this.$canvasFront = document.querySelector('.canvas-front');
        this.ctxFront = this.$canvasFront.getContext('2d');
        this.$btnNext = document.querySelector('.btn-next');
        this.$canvasWrap = document.querySelector('.m-canvas');
        this.touchPoint = {
            x: 0,
            y: 0
        };
        this.imageName = 'pic0';
        this.isInit = false;
        this.color = null;
        this.isSelected = false; // 是否已经选中纹样
        this.isAnimating = false; // 是否在动画执行中
        this.type = -1; // 当前纹样, -1未选中
        this.ZOOMRATIO = 1.6;
        this.DURATION = 800;
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
        this.showTouchHint();

        this.isInit = true;
    }

    drawImage (name) {
        let image = Config.Preload.buffer.imgs[name + '.jpg'];
        // let image = Config.Preload.buffer.imgs[`${name}_type0_area.png`];
        this.$canvasBack.width = image.width;
        this.$canvasBack.height = image.height;

        this.ctxBack.drawImage(image, 0, 0, image.width, image.height);

        this.imageData = Utils.getImageData(image);
    }

    getAreaData (name) {
        let areaImage = Config.Preload.buffer.imgs[`${name}_area.png`];
        // let areaImage = Config.Preload.buffer.imgs[`${name}.jpg`];
        let borderImage = Config.Preload.buffer.imgs[`${name}_border.png`];

        this.areaData = Utils.getImageData(areaImage);
        this.borderData = Utils.getImageData(borderImage);

        console.log(this.areaData);
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
            this.drawBorder({ r: 0, g: 0, b: 255 }, 'front');

            this.color = { r: 0, g: 0, b: 255 };
            this.type = 1;
        } else if (r === 251 && g === 255 && b === 0) {
            console.log('黄色');
            this.drawBorder({ r: 251, g: 255, b: 0 }, 'front');

            this.color = { r: 251, g: 255, b: 0 };
            this.type = 2;
        } else {
            this.color = null;
            Utils.fadeOut(this.$canvasFront, this.DURATION);
            this.disableTouch();

            setTimeout(() => {
                this.ctxFront.clearRect(0, 0, this.areaData.width, this.areaData.height);
            }, this.DURATION);
            this.type = -1;

            if (this.isSelected) {
                this.zoomOut();
                this.isSelected = false;
            }
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

        this.borderPixelIndexList = [];

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

            this.borderPixelIndexList.push(index);

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

    drawBorder (rgb, canvasIndex) {
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

        let image = Config.Preload.buffer.imgs[this.imageName + '.jpg'];
        let imageData = Utils.getImageData(image);

        // 替换像素
        for (let i = 0; i < pixelIndexList.length; i++) {
            let index = pixelIndexList[i];

            // 判断是否为透明色
            let borderData = this.borderData.data;
            if (borderData[index + 3] !== 0) {
                // imageData.data[index] = borderData[index];
                // imageData.data[index + 1] = borderData[index + 1];
                // imageData.data[index + 2] = borderData[index + 2];
                // imageData.data[index + 3] = borderData[index + 3];

                imageData.data[index] = 251;
                imageData.data[index + 1] = 255;
                imageData.data[index + 2] = 0;
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

            Y -= 100;
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

        // this.ctxBack.clearRect(0, 0, this.areaData.width, this.areaData.height);

        let canvas, ctx;
        if (canvasIndex === 'front') {
            canvas = this.$canvasFront;
            ctx = this.ctxFront;
        } else if (canvasIndex = 'back') {
            canvas = this.$canvasBack;
            ctx = this.ctxBack;
        } else {
            canvas = this.$canvasFront;
            ctx = this.ctxFront;
        }

        canvas.width = imageData.width;
        canvas.height = imageData.height;
        ctx.putImageData(imageData, 0, 0);

        if (!this.isSelected) {
            this.disableTouch();
            Utils.fadeIn(canvas, this.DURATION);
            this.isSelected = true;

            // this.zoomIn();
        }
        this.zoomIn();
    }

    /**
     * 计算纹样中心点
     *
     * @param {array} pixelIndexList 纹样对应像素数据索引
     * @param {number} width 画布宽度
     * @returns {object} 纹样中心点和纹样宽高
     * @memberof Draw
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

    zoomIn () {
        let centerPoint = this.calculateCenter(this.pixelIndexList, this.areaData.width);
        // let centerPoint = {
        //     x: this.areaData.width / 2,
        //     y: this.areaData.height / 2
        // };

        let initPoint = {
            x: this.areaData.width / 2,
            y: this.areaData.height / 2
        };

        let scaleX = this.imageData.width / centerPoint.width / this.ZOOMRATIO;
        let scaleY = this.imageData.height / centerPoint.height / this.ZOOMRATIO;
        let scale = scaleX > scaleY ? scaleY : scaleX;
        if (scale < 1) scale = 1;

        let moveX = Math.floor((initPoint.x - centerPoint.x) * this.ratio * scale);
        let moveY = Math.floor((initPoint.y - centerPoint.y) * this.ratio * scale);

        // 位移太小不如不移动
        console.log(`moveX: ${moveX}, moveY: ${moveY}`);
        if (Math.abs(moveX) < 10 && Math.abs(moveY) < 10) {
            moveX = 0;
            moveY = 0;
        }

        // 缩放太小不如不缩放
        console.log(`scale: ${scale}`);
        if (scale < 1.1) {
            scale = 1;
        }

        // TweenMax.to(this.$canvasWrap, this.DURATION / 1000, {
        //     x: moveX,
        //     y: moveY,
        //     scale: scale
        // });

        TweenMax.to(this.$canvasFront, this.DURATION / 1000, {
            x: moveX - this.areaData.width / 2 * this.ratio,
            y: moveY - this.areaData.height / 2 * this.ratio,
            scale: scale
        });

        Utils.fadeIn(document.querySelector('.canvas-text'));

        setTimeout(() => {
            // Utils.fadeOut(this.$canvasWrap, this.DURATION);
            this.goNext(this.color);
        }, this.DURATION);

        // setTimeout(() => {
        //     this.goNext(this.color);
        // }, this.DURATION * 2);

        // setTimeout(() => {
        //     Utils.fadeIn(this.$canvasWrap);
        // }, 1800);
    }

    zoomOut () {
        TweenMax.to(this.$canvasWrap, this.DURATION / 1000, {
            x: 0,
            y: 0,
            scale: 1
        });
    }

    /**
     * 前往下一个文物
     *
     * @param {object} color 识别颜色
     * @returns
     * @memberof Draw
     */
    async goNext (color) {
        if (this.isAnimating) return;
        if (color === null) return;
        if (this.type < 0) return;

        this.isEnd = true;

        let data = Config.dataList[this.type];

        switch (this.type) {
            // 龙纹
            case 0:
                break;
            // 云朵
            case 1:
                break;
        }
        // this.zoomIn();

        console.log(data);
        // Utils.fadeOut(this.$canvasWrap, this.DURATION);

        let newRelic = new Relic(data.name);
        await newRelic.loadImg();
        let frontData = newRelic.getDefaultState();
        let newData = newRelic.drawBorder(this.color);

        setTimeout(() => {
            // this.$canvasBack.width = newData.width;
            // this.$canvasBack.height = newData.height;
            // this.ctxBack.putImageData(newData, 0, 0);
            newRelic.zoomIn(this.$canvasBack, 100);

            // Utils.fadeOut(this.$canvasBack, this.DURATION);

            // Utils.fadeOut(this.$canvasFront, 50);

            this.$canvasBack.width = frontData.width;
            this.$canvasBack.height = frontData.height;
            this.ctxBack.putImageData(frontData, 0, 0);

            setTimeout(() => {
                // Utils.fadeIn(this.$canvasWrap, this.DURATION);
                Utils.fadeOut(this.$canvasFront, this.DURATION);
                Utils.fadeIn(this.$canvasBack, this.DURATION);
            }, 300);

            setTimeout(() => {
                // TweenMax.to(this.$canvasWrap, this.DURATION / 1000, {
                //     x: 0,
                //     y: 0,
                //     scale: 1
                // });
                Utils.fadeOut(document.querySelector('.canvas-text'));
            }, this.DURATION + 300);
        }, this.DURATION);
    }

    showTouchHint () {
        this.isAnimating = true;

        let data = this.borderData;
        let border1, border2;
        console.log(data);
        border1 = new ImageData(data.width, data.height);
        border2 = new ImageData(data.width, data.height);
        for (let i = 0; i < data.data.length; i += 4) {
            let r = data.data[i];
            let g = data.data[i + 1];
            let b = data.data[i + 2];
            let a = data.data[i + 3];

            if (a !== 0) {
                // data.data[i] = 251;
                // data.data[i + 1] = 255;
                // data.data[i + 2] = 0;

                if (data.data[i] === 0) {
                    border1.data[i] = 251;
                    border1.data[i + 1] = 255;
                    border1.data[i + 2] = 0;
                    border1.data[i + 3] = data.data[i + 3];
                } else {
                    border2.data[i] = 251;
                    border2.data[i + 1] = 255;
                    border2.data[i + 2] = 0;
                    border2.data[i + 3] = data.data[i + 3];
                }
                // data.data[i + 3] = 255;
                // data.data[i + 3] = data.data[i + 3];
            } else {
                // data.data[i] = this.imageData.data[i];
                // data.data[i + 1] = this.imageData.data[i + 1];
                // data.data[i + 2] = this.imageData.data[i + 2];
                // data.data[i + 3] = this.imageData.data[i + 3];

                border1.data[i] = 255;
                border1.data[i + 1] = 255;
                border1.data[i + 2] = 255;
                border1.data[i + 3] = 0;

                border1.data[i] = 255;
                border1.data[i + 1] = 255;
                border1.data[i + 2] = 255;
                border1.data[i + 3] = 0;
            }
        }

        // this.ctxBack.putImageData(data, 0, 0);

        let ctx1 = document.querySelector('.touch-hint-1').getContext('2d');
        let ctx2 = document.querySelector('.touch-hint-2').getContext('2d');

        document.querySelector('.touch-hint-1').width = data.width;
        document.querySelector('.touch-hint-1').height = data.height;
        document.querySelector('.touch-hint-2').width = data.width;
        document.querySelector('.touch-hint-2').height = data.height;
        ctx1.putImageData(border1, 0, 0);
        ctx2.putImageData(border2, 0, 0);

        document.querySelector('.touch-hint-1').style.display = 'block';
        document.querySelector('.touch-hint-2').style.display = 'block';

        setTimeout(() => {
            document.querySelector('.touch-hint-1').style.display = 'none';
            document.querySelector('.touch-hint-2').style.display = 'none';
            this.isAnimating = false;
        }, 6600);
    }

    reset () {
        this.color = null;
        this.pixelIndexList = [];
        this.isSelected = false;
        this.type = -1;
    }

    disableTouch (delay = this.DURATION) {
        this.isAnimating = true;
        setTimeout(() => {
            this.isAnimating = false;
        }, delay);
    }

    bindEvent () {
        this.$canvasBack.addEventListener('click', (e) => {
            if (this.isEnd) return;
            if (this.isAnimating) return;
            let ratio = this.$canvasBack.clientWidth / this.imageData.width;
            this.ratio = ratio;
            this.touchPoint.x = Math.floor(e.offsetX / ratio);
            this.touchPoint.y = Math.floor(e.offsetY / ratio);
            this.checkPoint(this.touchPoint);
        });

        this.$btnNext.addEventListener('click', () => {
            this.goNext(this.color);
        });

        this.$canvasWrap.addEventListener('click', (e) => {
            if (this.isEnd) return;
            if (e.target.tagName === 'CANVAS') return;
            if (!this.isSelected || this.isAnimating) return;
            this.color = null;
            Utils.fadeOut(this.$canvasFront, this.DURATION);
            this.disableTouch();

            if (this.isSelected) {
                setTimeout(() => {
                    this.ctxFront.clearRect(0, 0, this.areaData.width, this.areaData.height);
                }, this.DURATION);
                this.zoomOut();
                this.isSelected = false;
                this.type = -1;
            }
        });
    }
};
