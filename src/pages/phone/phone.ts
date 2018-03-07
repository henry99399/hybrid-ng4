import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../app/app.service';
import { LoginPage } from '../login/login';
@Component({
  selector: 'page-phone',
  templateUrl: 'phone.html'
})
export class PhonePage {
  phone: any;
  code: any;
  account: any;
  num: number = 0;
  constructor(public navCtrl: NavController, private service: AppService) {
    this.phone = service.LoginUserInfo.phone;
    this.account = service.LoginUserInfo.phone;
    if (service.LoginUserInfo.phone) {
      this.phone = service.LoginUserInfo.phone.substr(0, 3) + '****' + service.LoginUserInfo.phone.substr(7, 4);
    }
  }
  getCode() {
    if (this.num == 0 && this.phone && /^1[34578]\d{9}$/.test(this.phone)) {
      this.num = 60;
      this.service.post('/v2/api/mobile/validCode/sendValidCode', {
        account: this.phone,
        type: 'changePhone'
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
      this.service.dialogs.alert('请输入正确的手机号码!', '提示', '确定');
    }
  }
  submit() {
    if (!this.phone || !/^1[34578]\d{9}$/.test(this.phone)) {
      this.service.dialogs.alert('请输入正确的手机号码!', '提示', '确定');
    }
    else if (!this.code) {
      this.service.dialogs.alert('请输入手机验证码!', '提示', '确定');
    }
    else {
      this.service.post('/v2/api/mobile/memberInfo/updatePhone', {
        token: this.service.token,
        type: 'changePhone',
        phone: this.phone,
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
          this.service.dialogs.alert('手机已绑定成功!', '提示', '确定');
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
