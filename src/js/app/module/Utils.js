// import Config from './Config.js';

const Utils = {};

Utils.callbacks = [];
Utils.on = (name, callback) => {
    Utils.callbacks[name] = Utils.callbacks[name] || [];
    Utils.callbacks[name].push(callback);
};

Utils.off = (name, callback) => {
    const callbacks = Utils.callbacks[name];
    if (callbacks && callbacks instanceof Array) {
        const index = callbacks.indexOf(callback);
        if (index !== -1) callbacks.splice(index, 1);
    }
};

Utils.trigger = (name, params) => {
    const callbacks = Utils.callbacks[name];
    if (callbacks && callbacks instanceof Array) {
        callbacks.forEach((cb) => {
            cb(params);
        });
    }
};

Utils.fadeIn = (ele, delay) => {
    if (typeof delay !== 'number') {
        delay = 600;
    }
    ele.style.opacity = '0';
    ele.style.display = 'block';
    ele.style.transitionProperty = 'opacity';
    ele.style.webkitTransitionProperty = 'opacity';
    ele.style.transitionDuration = (delay / 1000) + 's';
    ele.style.webkitTransitionDuration = (delay / 1000) + 's';

    setTimeout(() => {
        ele.style.opacity = '1';
    }, 100);

    setTimeout(() => {
        ele.style.transitionProperty = 'initial';
        ele.style.webkitTransitionProperty = 'initial';
        ele.style.transitionDuration = 'initial';
        ele.style.webkitTransitionDuration = 'initial';
    }, delay + 200);
};

Utils.fadeOut = (ele, delay) => {
    if (typeof delay !== 'number') {
        delay = 600;
    }
    ele.style.transitionProperty = 'opacity';
    ele.style.webkitTransitionProperty = 'opacity';
    ele.style.transitionDuration = (delay / 1000) + 's';
    ele.style.webkitTransitionDuration = (delay / 1000) + 's';
    setTimeout(() => {
        ele.style.opacity = '0';
    }, 100);

    setTimeout(() => {
        ele.style.display = 'none';
        ele.style.transitionProperty = 'initial';
        ele.style.webkitTransitionProperty = 'initial';
        ele.style.transitionDuration = 'initial';
        ele.style.webkitTransitionDuration = 'initial';
    }, delay + 200);
};

Utils.checkWord = (text, list) => {
    for (let i = 0; i < list.length; i++) {
        if (text === list[i]) {
            return true;
        }
    }
    return false;
};

Utils.initWebaudio = (url, autoplay) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    let source = audioCtx.createBufferSource();
    var request = new XMLHttpRequest();

    request.open('GET', url, true);

    request.responseType = 'arraybuffer';

    window.bgm = null;

    request.onload = () => {
        var audioData = request.response;

        audioCtx.decodeAudioData(audioData, (buffer) => {
            source.buffer = buffer;

            source.connect(audioCtx.destination);
            source.loop = true;

            if (autoplay === 'autoplay') {
                source.start(0);
            }
            window.bgm = source;

            // return source;

            // document.querySelector('.btn-mute').addEventListener('click', () => {
            //     if (this.isMute) {
            //         this.isMute = false;
            //         source.connect(audioCtx.destination);
            //         document.querySelector('.btn-mute').classList.remove('mute');
            //         document.querySelector('video').muted = false;
            //     } else {
            //         this.isMute = true;
            //         source.disconnect(audioCtx.destination);
            //         document.querySelector('.btn-mute').classList.add('mute');
            //         document.querySelector('video').muted = true;
            //     }
            // });
        },
        (e) => {
            console.log(e);
        });
    };

    return request.send();
};

Utils.initSimpleWebaudio = (url) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // let source = audioCtx.createBufferSource();
    var request = new XMLHttpRequest();

    request.open('GET', url, true);

    request.responseType = 'arraybuffer';

    // request.onload = () => {
    //     var audioData = request.response;

    //     audioCtx.decodeAudioData(audioData, (buffer) => {
    //         source.buffer = buffer;

    //         source.connect(audioCtx.destination);
    //         source.loop = true;
    //     },
    //     (e) => {
    //         console.log(e);
    //     });
    // };

    // return request.send();

    return new Promise((resolve, reject) => {
        request.onload = () => {
            var audioData = request.response;
            audioCtx.decodeAudioData(audioData, (buffer) => {
                buffer.start = (isLoop = 0) => {
                    let source = audioCtx.createBufferSource();
                    source.buffer = buffer;
                    source.connect(audioCtx.destination);
                    if (isLoop === 1) {
                        source.loop = true;
                        buffer.source = source;
                    } else if (isLoop === 2) {
                        source.disconnect(audioCtx.destination);
                        // 提前在点击事件静默调用音源，解决ios非交互不能播放音频问题
                    }
                    source.start();
                };
                resolve(buffer);
            },
            (e) => {
                console.log(e);
            });
        };
        request.send();
    });
};

Utils.showSimpleMessage = (text) => {
    let msg = document.querySelector('.simple-msg');
    msg.innerHTML = text;
    msg.style.opacity = '1';
};

Utils.hideSimpleMessage = (callback) => {
    let msg = document.querySelector('.simple-msg');
    msg.style.opacity = '0';
    setTimeout(() => {
        callback && callback();
    }, 600);
};

Utils.showHideSimpleMessage = (text, callback) => {
    let msg = document.querySelector('.simple-msg');
    msg.innerHTML = text;
    msg.style.opacity = '1';

    setTimeout(() => {
        msg.style.opacity = '0';
    }, 2000);

    setTimeout(() => {
        callback && callback();
    }, 2600);
};

Utils.buildQrcode = (url) => {
    const $qrcode = document.createElement('div');
    const qrcode = new QRCode($qrcode, {
        text: url,
        width: 150,
        height: 150,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.L
    });

    console.log(qrcode);

    try {
        Config.defShare.link = url;
        TD.wxShare(Config.defShare);
    } catch (e) {
        console.log(e);
    }

    return $qrcode.lastChild;
};

Utils.buildCanvas = (imgList) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const imgCanvas = new Image();
    let shareImgData;

    canvas.width = 750;
    canvas.height = 1600;

    setTimeout(() => {
        for (let x in imgList) {
            ctx.drawImage(imgList[x], 0, 0, canvas.width, canvas.height);
        }
        shareImgData = canvas.toDataURL('image/png');
        imgCanvas.src = shareImgData;

        return imgCanvas;
    }, 100);
};

Utils.lastText = {
    x: 0, // 上一段文本的x坐标
    y: 0,
    width: 0 // 文本宽度
};
Utils.newLine = (ctx, text, x, y, fontSize, color) => {
    ctx.font = `${fontSize} kaiti`;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    Utils.lastText = {
        x: x,
        y: y,
        width: ctx.measureText(text).width
    };
};

Utils.followLine = (ctx, text, spacing, fontSize, color) => {
    let x = Utils.lastText.x + Utils.lastText.width + spacing;
    let y = Utils.lastText.y;
    ctx.font = `${fontSize} kaiti`;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    Utils.lastText = {
        x: x,
        y: y,
        width: ctx.measureText(text).width
    };
};

export default Utils;
