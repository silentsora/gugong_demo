
/*
*
*  引入lib库文件和LESS文件
*  必须要引入,过滤器会过滤lib文件夹里面的JS文件,做一个简单的复制
*  复制到相应的文件夹
*  引入的less会对less进行编译存放到css文件夹
* */
import '../less/style.less';
import Loading from './app/Loading.js';
import Video from './app/Video.js';
import End from './app/End.js';
import Draw from './app/Draw.js';

import transitions from 'gl-transitions';
import createTransition from 'gl-transition';
import createTexture from 'gl-texture2d';

class Index {
    constructor () {
        this.loadingCtrl = new Loading();
        this.videoCtrl = new Video();
        this.endCtrl = new End();
        this.drawCtrl = new Draw();
    }

    async phaseLoad () {
        this.loadingCtrl.init();
        await this.loadingCtrl.preload();
        await this.loadingCtrl.mainLoad();
        // await this.loadingCtrl.promiseOnload();
        // this.phaseVideo();
        this.phaseDraw();
    }

    phaseDraw () {
        this.drawCtrl.init();
    }

    async phaseVideo () {
        this.videoCtrl.init();
        await this.videoCtrl.playVideo();
        this.videoCtrl.show();
        this.loadingCtrl.hide();
        await this.videoCtrl.promiseVideoEnd();
        this.phaseEnd();
    }

    async phaseEnd () {
        this.endCtrl.init();
        this.endCtrl.show();
        this.videoCtrl.hide();
        await this.endCtrl.promiseRetry();
        this.phaseVideo();
    }

    showTransition () {
        let canvas = document.querySelector('.canvas-back');
        let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        canvas.width = 750;
        canvas.height = 750;

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, -1, 4, 4, -1]),
            gl.STATIC_DRAW
        );
        gl.viewport(0, 0, 750, 750);

        const img1 = new Image();
        img1.src = require('../img/pic0.jpg');

        const img2 = new Image();
        img2.src = require('../img/pic1.jpg');

        const promise1 = new Promise((resolve, reject) => {
            img1.onload = () => {
                resolve();
            };
        });
        const promise2 = new Promise((resolve, reject) => {
            img2.onload = () => {
                resolve();
            };
        });

        Promise.all([promise1, promise2]).then(() => {
            const from = createTexture(gl, img1);
            from.minFilter = gl.LINEAR;
            from.magFilter = gl.LINEAR;

            const to = createTexture(gl, img2);
            to.minFilter = gl.LINEAR;
            to.magFilter = gl.LINEAR;

            // from.wrap = [gl.MIRRORED_REPEAT, gl.REPEAT];

            let initName = 'morph';
            console.log(transitions);
            let transition = createTransition(gl, transitions.find(t => t.name === initName));
            document.querySelector('.transition-type').innerHTML = initName;

            const loop = (t) => {
                requestAnimationFrame(loop);
                let uTime = Math.abs(Math.sin(t / 1000));

                if (Math.cos(t / 1000) * Math.sin(t / 1000) > 0) {
                    uTime = Math.abs(Math.sin(t / 1000));
                } else {
                    uTime = 0;
                }
                // console.log(uTime);
                // transition.draw((t / 3000) % 1, from, to, canvas.width, canvas.height, { amplitude: 30, speed: 30 });
                transition.draw(uTime, from, to, canvas.width, canvas.height);
            };
            requestAnimationFrame(loop);

            let index = 3;
            // let list = ['WaterDrop', 'CrossZoom', 'Dreamy', 'GridFlip', 'InvertedPageCurl', 'crosshatch', 'displacement', 'luma', 'morph', 'randomsquares', 'ripple', 'rotate_scale_fade', 'swap'];
            transition = createTransition(gl, transitions[index]);
            // document.querySelector('.transition-type').innerHTML = list[index];
            document.querySelector('.transition-type').innerHTML = (index + 1) + '.' + transitions[index].name;

            document.querySelector('.btn-switch').addEventListener('click', () => {
                index++;
                if (index > transitions.length - 1) index = 0;

                document.querySelector('.transition-type').innerHTML = (index + 1) + '.' + transitions[index].name;
                transition = createTransition(gl, transitions[index]);
                // if (index > list.length - 1) index = 0;
                // document.querySelector('.transition-type').innerHTML = list[index];
                // transition = createTransition(gl, transitions.find(t => t.name === list[index]));
            });
        });
    }
}

const index = new Index();
index.phaseLoad();
