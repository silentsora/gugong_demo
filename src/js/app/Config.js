import Preload from './module/Preload.js';

var Config = {};

// ajax请求链接
Config.requireUrl = '';

// 图片路径前缀
// 如kf文件里图片不使用require时 img地址：Config.imgPath
Config.imgPath = process.env.NODE_ENV === 'handover' ? process.env.PATH : process.env.PATH + 'img/';

// 默认分享语
Config.defShare = {
    title: '分享标题',
    desc: '分享描述',
    link: location.href,
    // 分享配图
    img: Config.imgPath + 'share.jpg',
    // 项目名，数据查询时候用
    proj: 'streetgame',
    // 填写公众号绑定的appid
    appid: 'wx045f59bcba3061c4', // click 所有appid通用
    // apppid: 'wx875c7888a7aef3f7', // v2，限定appid
    cnzz: '1259179479'
};

Config.Preload = Preload;

// 前置加载的图片
Config.preImgs = {
    imgs: [
        // {
        //     name: 'pic0',
        //     url: require('../../img/pic0.jpg'),
        //     crossOrigin: true
        // }
    ],
    sprites: [
        /*
        {
            el: $('.m-game .kf-game-video'),
            pathPrefix: Config.imgPath,
            postfix: 'jpg'
        }
        */
    ],
    keyimgs: [
        /*
        {
            el: $('.m-game .kf-game-video'),
            pathPrefix: Config.imgPath,
            postfix: 'jpg'
        }
        */
    ]
};

// 预加载的图片
Config.mainImgs = {
    imgs: [
        {
            name: 'pic0.jpg',
            url: require('../../img/pic0.jpg'),
            crossOrigin: true
        },
        {
            name: 'pic0_area.png',
            url: require('../../img/pic0_area.png'),
            crossOrigin: true
        },
        {
            name: 'pic0_border.png',
            url: require('../../img/pic0_border.png'),
            crossOrigin: true
        }
    ],
    sprites: [
        /*
        {
            el: $('.m-game .kf-game-video'),
            pathPrefix: Config.imgPath,
            postfix: 'jpg'
        }
        */
    ],
    keyimgs: [
        /*
        {
            el: $('.m-game .kf-game-video'),
            pathPrefix: Config.imgPath,
            postfix: 'jpg'
        }
        */
    ]
};

export default Config;
