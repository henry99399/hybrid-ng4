import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { RechargePage } from '../recharge/recharge';
import { QiandaoPage } from '../qiandao/qiandao';
import { SetingPage } from '../seting/seting';
import { ReadJiluPage } from '../readjilu/readjilu';
import { ReviewsPage } from '../reviews/reviews';
import { AppService } from '../../app/app.service';

@Component({
  selector: 'page-center',
  templateUrl: 'center.html'
})
export class CenterPage {
  constructor(public navCtrl: NavController, private service: AppService) {

  }
  充值
  to_recharge() {
    if (this.service.getNetEork()  == 'none') {
      this.service.dialogs.alert('网络异常，请检查你的网络状态正常后再试!', '提示', '确定');
      return false;
    }
    this.navCtrl.push(RechargePage);
  }
  //前往设置
  to_seting() {
    if (this.service.getNetEork()  == 'none') {
      this.service.dialogs.alert('网络异常，请检查你的网络状态正常后再试!', '提示', '确定');
      return false;
    }
    this.navCtrl.push(SetingPage);
  }
  //前往签到
  toqiandao() {
    if (this.service.getNetEork()  == 'none') {
      this.service.dialogs.alert('网络异常，请检查你的网络状态正常后再试!', '提示', '确定');
      return false;
    }
    this.navCtrl.push(QiandaoPage);
  }
  //阅读记录
  toReadJilu() {
    if (this.service.getNetEork()  == 'none') {
      this.service.dialogs.alert('网络异常，请检查你的网络状态正常后再试!', '提示', '确定');
      return false;
    }
    this.navCtrl.push(ReadJiluPage);
  }
  //评论列表
  toReviews() {
    if (this.service.getNetEork()  == 'none') {
      this.service.dialogs.alert('网络异常，请检查你的网络状态正常后再试!', '提示', '确定');
      return false;
    }
    this.navCtrl.push(ReviewsPage);
  }
  //千分位换算
  toThousands(num) {
    let result = '', counter = 0;
    num = (num || 0).toString();
    for (let i = num.length - 1; i >= 0; i--) {
      counter++;
      result = num.charAt(i) + result;
      if (!(counter % 3) && i != 0) { result = ',' + result; }
    }
    return result;
  }
  ionViewWillEnter() {
    this.service.statusBar.styleDefault();
    if (this.service.getNetEork()  != 'none') {
      console.log('重新获取用户信息');
      console.log(navigator.userAgent);
      this.service.getUserInfo();
      console.log(this.service.LoginUserInfo)
    }
  }
}
