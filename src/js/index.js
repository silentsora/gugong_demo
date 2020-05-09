
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
}

const index = new Index();
index.phaseLoad();
