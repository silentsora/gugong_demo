import Config from './Config.js';
import TD from './module/TD.js';

// 加载页对象
export default class Loading {
    constructor () {
        this.$loadingWrap = document.querySelector('.m-loading');
        this.$preLoading = document.querySelector('.pre-loading');
        this.$btnStart = document.querySelector('.btn-start');
        this.preLoader = new Config.Preload(Config.preImgs); // 前置加载
        this.mainLoader = new Config.Preload(Config.mainImgs); // 主体加载
    }

    show () {
        this.$preLoading.style.display = 'none';
        this.$loadingWrap.style.display = 'block';
    }

    hide () {
        this.$loadingWrap.style.display = 'none';
    }

    init () {
        if (this.isInit === true) {
            return;
        }

        this.customizedFunction();

        this.isInit = true;
    }

    customizedFunction () {
        // 阻止微信下拉；原生js绑定覆盖zepto的默认绑定
        document.body.addEventListener('touchmove', function (e) {
            const event = e || window.event;
            const className = event.target.getAttribute('class');
            if (/permit-scroll/.test(className) === false) {
                event.preventDefault();
            }
        }, { passive: false });

        // 横屏时提示竖屏
        TD.portraitTips(document.querySelector('.portrait-hint'));

        // cnzz统计代码 强制HTTPS，防劫持
        // (function () {
        //     var cnzzID = Config.defShare.cnzz;
        //     document.write(unescape('%3Cspan id="cnzz_stat_icon_' + cnzzID + '"%3E%3C/span%3E%3Cscript src="' + 'https://s4.cnzz.com/z_stat.php%3Fid%3D' + cnzzID + '" type="text/javascript"%3E%3C/script%3E'));
        //     $('#cnzz_stat_icon_' + cnzzID).hide();
        // })();

        // 初始化微信接口
        // TD.initWxApi(Config.defShare);
    }

    preload () {
        this.preLoader.onloading = (p) => {
            // console.log(p);
        };

        this.preLoader.onfail = (msg) => {
            console.log(msg);
        };

        return new Promise((resolve, reject) => {
            this.preLoader.onload = () => {
                console.log('preLoader onload');
                this.show();
                resolve();
            };
            this.preLoader.load();
        });
    }

    mainLoad () {
        this.mainLoader.onloading = (p) => {
            // console.log(p);
        };

        this.mainLoader.onfail = (msg) => {
            console.log(msg);
        };

        return new Promise((resolve, reject) => {
            console.log('main load');
            this.mainLoader.onload = () => {
                console.log('mainLoader onload');
                resolve();
            };
            this.mainLoader.load();
        });
    }

    promiseOnload () {
        this.$btnStart.style.display = 'block';
        return new Promise((resolve, reject) => {
            this.$btnStart.addEventListener('click', (e) => {
                resolve();
            });
        });
    }
};
