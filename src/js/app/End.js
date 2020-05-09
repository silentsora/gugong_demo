import Utils from './module/Utils.js';
// import Config from './Config.js';
// import TD from './module/TD.js';

// 加载页对象
export default class End {
    constructor () {
        this.$page = document.querySelector('.m-end');
        this.$btnRetry = document.querySelector('.btn-retry');
        this.$btnShare = document.querySelector('.btn-share');
        this.$btnJump = document.querySelector('.btn-jump');
        this.isInit = false;
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

        this.isInit = true;
    }

    bindEvent () {
        this.$btnShare.addEventListener('click', () => {
            this.$share.style.display = 'block';
        });
        this.$share.addEventListener('click', () => {
            // this.$share.style.display = 'none';
            // this.$share.innerHTML = '';
        });
    }

    promiseRetry () {
        this.$btnRetry.onclick = null;
        return new Promise((resolve, reject) => {
            this.$btnRetry.onclick = (e) => {
                this.hide();
                resolve('retry');
            };
        });
    }
};
