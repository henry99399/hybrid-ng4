import { Component, ViewChild } from '@angular/core';
import { Platform, IonicApp, Nav, ToastController } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AppService } from './app.service';
import { TabsPage } from '../pages/tabs/tabs';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = TabsPage;
  backButtonPressed: boolean = false;  //用于判断返回键是否触发
  @ViewChild('myNav') nav: Nav;
  constructor(public ionicApp: IonicApp, private platform: Platform, private splashScreen: SplashScreen, private service: AppService, public toastCtrl: ToastController) {
    platform.ready().then(() => {
      this.service.init(() => {
        //判断是否有网络
        if (this.service.getNetEork() != 'none' || this.service.platformName == 'weixin') {
          let param = {
            account: new Date().getTime(),
            pwd: '123456'
          }
          if (this.service.LoginUserInfo) {
            param.account = this.service.LoginUserInfo.account;
            param.pwd = this.service.LoginUserInfo.pwd;
            //重新登录
            this.login(param);
          }
          else {
            this.registe(param);
          }
        }
        else {
          this.service.unRefreshBookshelf = true;
          //隐藏启动页
          this.splashScreen.hide();
        }
      });
      this.registerBackButtonAction();//注册返回按键事件
    });
  }

  registerBackButtonAction() {
    this.platform.registerBackButtonAction(() => {
      //如果想点击返回按钮隐藏toast或loading或Overlay就把下面加上
      // this.ionicApp._toastPortal.getActive() || this.ionicApp._loadingPortal.getActive() || this.ionicApp._overlayPortal.getActive()
      let activePortal = this.ionicApp._modalPortal.getActive();
      if (activePortal) {
        activePortal.dismiss().catch(() => {});
        activePortal.onDidDismiss(() => {});
        return;
      }
      let activeVC = this.nav.getActive();
      let tabs = activeVC.instance.tabs;
      let activeNav = tabs.getSelected();
      return activeNav.canGoBack() ? activeNav.pop() : this.showExit()
    }, 1);
  }

  //双击退出提示框
  showExit() {
    if (this.backButtonPressed) { //当触发标志为true时，即2秒内双击返回按键则退出APP
      this.platform.exitApp();
    } else {
      this.toastCtrl.create({
        message: '再按一次退出应用',
        duration: 2000,
        position: 'top'
      }).present();
      this.backButtonPressed = true;
      setTimeout(() => this.backButtonPressed = false, 2000);//2秒内没有再次点击返回则将触发标志标记为false
    }
  }

  //注册
  registe(param: any) {
    this.service.post("/v2/api/mobile/registe", param).then(success => {
      console.log(success)
      this.login(param);
    }, error => {
      this.service.unRefreshBookshelf = true;
      //隐藏启动页
      this.splashScreen.hide();
    })
  }

  //登录
  login(param: any) {
    this.service.post('/v2/api/mobile/login', param).then(success => {
      console.log(success)
      if (success.code == 0) {
        this.service.LoginUserInfo = success.data;
        this.service.LoginUserInfo.pwd = param.pwd;
        this.service.token = success.data.token;
        //存储用户信息
        localStorage.setItem('LoginUserInfo', JSON.stringify(this.service.LoginUserInfo));
        this.service.unRefreshBookshelf = true;
        //隐藏启动页
        this.splashScreen.hide();
      }
      else {
        localStorage.removeItem('LoginUserInfo');
        this.service.LoginUserInfo = null;
        this.service.unRefreshBookshelf = true;
        //隐藏启动页
        this.splashScreen.hide();
      }
    }, error => {
      this.service.unRefreshBookshelf = true;
      //隐藏启动页
      this.splashScreen.hide();
    })
  }
}
