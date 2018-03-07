import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../app/app.service';
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-qianming',
  templateUrl: 'qianming.html'
})
export class QianmingPage {
  sign: any;
  nickName: any;
  constructor(public navCtrl: NavController, private service: AppService) {
    this.sign = service.LoginUserInfo.sign;
    this.nickName = service.LoginUserInfo.nick_name;
    console.log(service.LoginUserInfo)
  }
  ionViewWillEnter() {
    this.service.statusBar.styleDefault();
  }
  submit() {
    if (this.sign) {
      this.service.post('/v3/member/updateMemberInfo', {
        nickName: this.nickName,
        sign: this.sign
      }).then(success => {
        if (success.code == 600) {
          this.service.loadingEnd();
          this.navCtrl.push(LoginPage);
        }
        else if (success.code != 0) {
          this.service.loadingEnd();
          this.service.dialogs.alert(success.message, '提示', '确定');
        }
        else {
          this.service.getUserInfo();
          this.navCtrl.pop();
        }
      })
    }
    else {
      this.service.dialogs.alert('请填写签名', '提示', '确定');
    }
  }

}
