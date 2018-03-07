import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../app/app.service';
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-nickname',
  templateUrl: 'nickname.html'
})
export class NickNamePage {
  nickName: any;
  constructor(public navCtrl: NavController, private service: AppService) {
    this.nickName = service.LoginUserInfo.nick_name;
  }
  ionViewWillEnter() {
    this.service.statusBar.styleDefault();
  }
  submit() {
    if (this.nickName) {
      this.service.post('/v3/member/updateMemberInfo', {
        nickName: this.nickName
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
      this.service.dialogs.alert('请填写用户昵称', '提示', '确定');
    }
  }

}
