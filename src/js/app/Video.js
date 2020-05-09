// import Utils from './module/Utils.js';
// import Config from './Config.js';
// import TD from './module/TD.js';

// 加载页对象
export default class Loading {
    constructor () {
        this.$videoWrap = document.querySelector('.m-video');
        this.$video = document.querySelector('.video');
        this.$videoLoading = document.querySelector('.video-loading');
        this.$btnSkip = document.querySelector('.btn-skip');
        this.isInit = false;
        this.isSkip = false;
        this.isEnd = false;
        this.isPlaying = false;
    }

    show () {
        this.$videoWrap.style.display = 'block';

        setTimeout(() => {
            this.$btnSkip.style.display = 'block';
        }, 1000);
    }

    hide () {
        this.$videoWrap.style.display = 'none';
        this.$btnSkip.style.display = 'none';
    }

    init () {
        if (this.isInit === true) {
            return;
        }

        this.isInit = true;
    }

    playVideo () {
        this.isEnd = false;
        // this.$video.play();
        this.$videoLoading.style.display = 'block';

        return new Promise((resolve, reject) => {
            let inv = setInterval(() => {
                if (this.$video.currentTime > 0.01) {
                    clearInterval(inv);
                    this.isPlaying = true;
                    this.$videoLoading.style.display = 'none';
                    resolve();
                }
            }, 50);
        });
    }

    promiseVideoEnd () {
        this.$btnSkip.onclick = null;
        return new Promise((resolve, reject) => {
            this.$video.addEventListener('ended', (e) => {
                console.log('video end');
                resolve();
            });

            this.$btnSkip.onclick = (e) => {
                console.log('skip');
                this.$video.pause();
                resolve();
            };
        });
    }
};
