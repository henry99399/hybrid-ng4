import { Component } from '@angular/core';
import { NavController, Tabs } from 'ionic-angular';
import { AppService } from '../../app/app.service';
import { RegisterPage } from '../register/register';
import { ResetpwdPage } from '../resetpwd/resetpwd';

declare let Wechat: any;
declare let QQSDK: any;
declare let WeiboSDK: any;
declare let jQuery: any;
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  param = {
    account: null,
    pwd: null
  }
  constructor(public navCtrl: NavController, public service: AppService, private tab: Tabs) {

  }
  ionViewWillEnter() {
    this.service.statusBar.styleBlackTranslucent();
  }
  ionViewWillLeave() {
    this.service.statusBar.styleDefault();
  }
  backHome() {
    if (jQuery.readerParam) {
      this.service.dialogs.alert('请先登录!', '提示', '确定');
    }
    else {
      this.navCtrl.pop();
    }
  }
  //登录
  tologin() {
    if (!this.param.account) {
      this.service.dialogs.alert('请填写登录账号', '提示', '确定');
      return false;
    }
    if (!this.param.pwd) {
      this.service.dialogs.alert('请填写登录密码', '提示', '确定');
      return false;
    }
    this.service.post('/v2/api/mobile/login', this.param).then(success => {
      if (success.code == 0) {
        this.service.LoginUserInfo = success.data;
        this.service.LoginUserInfo.pwd = this.param.pwd;
        this.service.token = success.data.token;
        //存储用户信息
        localStorage.setItem('LoginUserInfo', JSON.stringify(this.service.LoginUserInfo));
        this.service.unRefreshBookshelf = true;
        console.log(this.service.LoginUserInfo);
        this.tab.select(0);
        this.navCtrl.popToRoot();
      }
      else {
        this.service.dialogs.alert(success.message, '提示', '确定');
      }
    }, error => {
      this.service.dialogs.alert('网络异常，请检查你的网络状态正常后再试!', '提示', '确定');
    })
  }
  //前往注册
  toregister() {
    this.navCtrl.push(RegisterPage);
  }
  //找回密码
  resetpwd() {
    this.navCtrl.push(ResetpwdPage);
  }
  //进行注册
  reg_user(userId) {
    this.service.loadingStart();
    this.service.post("/v2/api/mobile/registe", {
      account: userId,
      pwd: '123456'
    }).then(success => {
      this.service.post('/v2/api/mobile/login', {
        account: userId,
        pwd: '123456'
      }).then(success => {
        this.service.loadingEnd();
        if (success.code == 0) {
          this.service.LoginUserInfo = success.data;
          this.service.LoginUserInfo.pwd = '123456';
          this.service.token = success.data.token;
          //存储用户信息
          localStorage.setItem('LoginUserInfo', JSON.stringify(this.service.LoginUserInfo));
          this.service.unRefreshBookshelf = true;
          this.navCtrl.popToRoot();
        }
        else {
          this.service.dialogs.alert(success.message, '提示', '确定');
        }
      }, err => {
        this.service.dialogs.alert('网络异常，请检查你的网络状态正常后再试!', '提示', '确定');
      })
    }, err => {
      this.service.dialogs.alert('网络异常，请检查你的网络状态正常后再试!', '提示', '确定');
    })
  }
  //微信登录
  weixin_login() {
    let scope = 'snsapi_userinfo';
    let state = '_' + (+new Date());
    Wechat.auth(scope, state, (response) => {
      let url: string = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx1726323de580e8ba&secret=80448ccbd8c9ef57a16d5a15d3dfc269&code=" + response.code + "&grant_type=authorization_code";
      this.service.post('/v3/otherMember/getJSONString', {
        otherURL: url
      }).then(res => {
        let jsonData = JSON.parse(res.data);
        this.reg_user(jsonData.openid)
        // let url_1 = "https://api.weixin.qq.com/sns/userinfo?access_token=" + jsonData.access_token + "&openid=" + jsonData.openid + "&lang=zh_CN";
        // this.service.post('/v3/otherMember/getJSONString', {
        //   otherURL: url_1
        // }).then(res_1 => {
        //   alert(res_1.data)
        // })
      }, err => {
        this.service.dialogs.alert('网络异常，请检查你的网络状态正常后再试!', '提示', '确定');
      })
    }, (reason) => {
      this.service.dialogs.alert(reason, '提示', '确定');
    });
  }
  //qq 登录
  qq_login() {
    let args = {
      client: QQSDK.ClientType.QQ
    };
    QQSDK.checkClientInstalled(() => {
      QQSDK.ssoLogin((result) => {
        this.reg_user(result.userid)
      }, (failReason) => {
        console.log(JSON.stringify(failReason));
      }, args);
    }, (error) => {
      this.service.dialogs.alert('未检测到QQ应用的安装，无法使用QQ第三方登录', '提示', '确定');
    }, args);
  }
  //微博登录
  weibo_login() {
    WeiboSDK.ssoLogin((args) => {
      console.log(JSON.stringify(args))
      this.reg_user(args.userId)
      // alert('access token is ' + args.access_token);
      // alert('userId is ' + args.userId);
      // alert('expires_time is ' + new Date(parseInt(args.expires_time)) + ' TimeStamp is ' + args.expires_time);
    }, (failReason) => {
      this.service.dialogs.alert(failReason, '提示', '确定');
    });
  }

}
