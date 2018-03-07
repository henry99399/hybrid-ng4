import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../app/app.service';
import { LoginPage } from '../login/login';
@Component({
  selector: 'page-email',
  templateUrl: 'email.html'
})
export class EmailPage {
  email: any;
  code: any;
  account: any;
  num: number = 0;
  constructor(public navCtrl: NavController, private service: AppService) {
    this.email = service.LoginUserInfo.email;
    this.account = service.LoginUserInfo.email;
    if (service.LoginUserInfo.email) {
      this.email = service.LoginUserInfo.email.substr(0, 2) + '***@' + service.LoginUserInfo.email.split('@')[1];
    }
  }
  ionViewWillEnter() {
    this.service.statusBar.styleDefault();
  }
  getCode() {
    if (this.num == 0 && this.email && /^1[34578]\d{9}$/.test(this.email)) {
      this.num = 60;
      this.service.post('/v2/api/mobile/validCode/sendValidCode', {
        account: this.email,
        type: 'changeemail'
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
          this.update_num();
        }
      })
    }
    else {
      this.service.dialogs.alert('请输入正确的邮箱号码!', '提示', '确定');
    }
  }
  submit() {
    if (!this.email || !/^1[34578]\d{9}$/.test(this.email)) {
      this.service.dialogs.alert('请输入正确的邮箱号码!', '提示', '确定');
    }
    else if (!this.code) {
      this.service.dialogs.alert('请输入邮箱验证码!', '提示', '确定');
    }
    else {
      this.service.post('/v2/api/mobile/memberInfo/updateEmail', {
        token: this.service.token,
        type: 'changeemail',
        email: this.email,
        code: this.code
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
          this.service.dialogs.alert('邮箱已绑定成功!', '提示', '确定');
          this.navCtrl.pop();
        }
      })
    }
  }
  update_num() {
    this.num -= 1;
    if (this.num > 0) {
      setTimeout(() => {
        this.update_num();
      }, 1000);
    }
    else {
      this.num = 0;
    }
  }
}
