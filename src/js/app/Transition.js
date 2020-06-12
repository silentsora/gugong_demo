import transitions from 'gl-transitions';
import createTransition from 'gl-transition';
import createTexture from 'gl-texture2d';

export default async function addTransition (from, to) {
    let canvas = document.querySelector('.canvas-webgl');
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

    const applyTransition = (fromImg, toImg) => {
        const from = createTexture(gl, fromImg);
        from.minFilter = gl.LINEAR;
        from.magFilter = gl.LINEAR;

        const to = createTexture(gl, toImg);
        to.minFilter = gl.LINEAR;
        to.magFilter = gl.LINEAR;

        // from.wrap = [gl.MIRRORED_REPEAT, gl.REPEAT];

        let list = ['WaterDrop', 'CrossZoom', 'Dreamy', 'GridFlip', 'InvertedPageCurl', 'crosshatch', 'displacement', 'luma', 'morph', 'perlin', 'randomsquares', 'ripple', 'rotate_scale_fade', 'swap'];
        let initName = 'morph';
        initName = 'perlin';
        initName = 'ColourDistance';
        initName = 'WaterDrop';
        console.log(transitions);
        let transition = createTransition(gl, transitions.find(t => t.name === initName), {
            resizeMode: 'cover'
        });
        // document.querySelector('.transition-type').innerHTML = initName;

        let counter = 0;

        return new Promise((resolve, reject) => {
            const loop = (t) => {
                // let uTime = Math.abs(Math.sin(t / 1000));

                // if (Math.cos(t / 1000) * Math.sin(t / 1000) > 0) {
                //     uTime = Math.abs(Math.sin(t / 1000));
                // } else {
                //     uTime = 0;
                // }

                // perlin
                // let uTime = Math.abs(Math.sin(counter / 90));
                // transition.draw(uTime, from, to, canvas.width, canvas.height, { smoothness: 0.1, seed: 2 });

                // ColourDistance
                // let uTime = Math.abs(Math.sin(counter / 60));
                // transition.draw(uTime, from, to, canvas.width, canvas.height, { power: 3 });

                // normal
                let uTime = Math.abs(Math.sin(counter / 60));
                transition.draw(uTime, from, to, canvas.width, canvas.height);

                counter++;

                console.log(uTime);

                if (uTime < 0.98) {
                    // transition.draw((t / 3000) % 1, from, to, canvas.width, canvas.height, { amplitude: 30, speed: 30 });
                    requestAnimationFrame(loop);
                } else {
                    resolve();
                }
            };
            requestAnimationFrame(loop);
        });

        // let index = 3;
        // // let list = ['WaterDrop', 'CrossZoom', 'Dreamy', 'GridFlip', 'InvertedPageCurl', 'crosshatch', 'displacement', 'luma', 'morph', 'perlin', 'randomsquares', 'ripple', 'rotate_scale_fade', 'swap'];
        // // transition = createTransition(gl, transitions[index]);
        // // document.querySelector('.transition-type').innerHTML = list[index];
        // // document.querySelector('.transition-type').innerHTML = (index + 1) + '.' + transitions[index].name;

        // document.querySelector('.btn-switch').addEventListener('click', () => {
        //     index++;
        //     if (index > transitions.length - 1) index = 0;

        //     document.querySelector('.transition-type').innerHTML = (index + 1) + '.' + transitions[index].name;
        //     transition = createTransition(gl, transitions[index]);
        //     // if (index > list.length - 1) index = 0;
        //     // document.querySelector('.transition-type').innerHTML = list[index];
        //     // transition = createTransition(gl, transitions.find(t => t.name === list[index]));
        // });
    };

    await applyTransition(from, to);

    return new Promise((resolve, reject) => {
        resolve();
    });

    // const img1 = new Image();
    // img1.src = require('../img/pic0.jpg');

    // const img2 = new Image();
    // img2.src = require('../img/pic1.jpg');

    // const promise1 = new Promise((resolve, reject) => {
    //     img1.onload = () => {
    //         resolve();
    //     };
    // });
    // const promise2 = new Promise((resolve, reject) => {
    //     img2.onload = () => {
    //         resolve();
    //     };
    // });

    // Promise.all([promise1, promise2]).then(() => {
    //     applyTransition(img1, img2);
    // });
}
