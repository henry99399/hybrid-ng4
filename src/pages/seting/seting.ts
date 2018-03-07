import { Component } from '@angular/core';
import { NavController, ActionSheetController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { LoginPage } from '../login/login';
import { NickNamePage } from '../nickname/nickname';
import { QianmingPage } from '../qianming/qianming';
import { PhonePage } from '../phone/phone';
import { EmailPage } from '../email/email';
import { ImagePicker } from '@ionic-native/image-picker';
import { AppService } from '../../app/app.service';

@Component({
  selector: 'page-seting',
  templateUrl: 'seting.html'
})
export class SetingPage {
  phone: any;
  email: any;
  cnum: number = 0;
  constructor(public navCtrl: NavController, public actionsheetCtrl: ActionSheetController,
    public camera: Camera, private service: AppService, public imagePicker: ImagePicker) {
    if (service.LoginUserInfo.phone) {
      this.phone = service.LoginUserInfo.phone.substr(0, 3) + '****' + service.LoginUserInfo.phone.substr(7, 4);
    }
    if (service.LoginUserInfo.email) {
      this.email = service.LoginUserInfo.email.substr(0, 2) + '***@' + service.LoginUserInfo.email.split('@')[1];
    }
  }
  ionViewWillEnter() {
    this.service.statusBar.styleDefault();
  }
  setPhone() {
    this.navCtrl.push(PhonePage);
  }
  setEmail() {
    this.navCtrl.push(EmailPage);
  }
  //签名
  setQianming() {
    this.navCtrl.push(QianmingPage);
  }
  //昵称
  setNickName() {
    this.navCtrl.push(NickNamePage);
  }
  toLogin() {
    this.navCtrl.push(LoginPage);
  }
  set_sex() {
    let actionSheet = this.actionsheetCtrl.create({
      title: '',
      cssClass: 'action-my-sheets',
      buttons: [
        {
          text: '男',
          role: 'destructive',
          icon: 'pp-center',
          handler: () => {
            this.service.post('/v3/member/updateMemberInfo', {
              sex: 1
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
              }
            })
          }
        },
        {
          text: '女',
          icon: 'pp-center',
          handler: () => {
            this.service.post('/v3/member/updateMemberInfo', {
              sex: 2
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
              }
            })
          }
        }
      ]
    });
    actionSheet.present();
  }
  set_user_head() {
    let actionSheet = this.actionsheetCtrl.create({
      title: '',
      cssClass: 'action-my-sheets',
      buttons: [
        {
          text: '拍照',
          role: 'destructive',
          icon: 'pp-center',
          handler: () => {
            this.paizhao();
          }
        },
        {
          text: '从相册选择',
          icon: 'pp-center',
          handler: () => {
            this.xiangche();
          }
        }
      ]
    });
    actionSheet.present();
  }
  paizhao() {
    const options: CameraOptions = {
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: this.camera.PictureSourceType.CAMERA,
      encodingType: this.camera.EncodingType.JPEG
    }
    this.camera.getPicture(options).then((imageURI) => {
      this.uploadFile(imageURI);
    }, (err) => {
      //this.service.dialogs.alert(err, '提示', '确定');
    });
  }
  xiangche() {
    const options: any = {
      maximumImagesCount: 1
    }
    this.imagePicker.getPictures(options).then((results) => {
      var imageURI = null;
      for (var i = 0; i < results.length; i++) {
        imageURI = results[i];
      }
      this.uploadFile(imageURI);
    }, (err) => {
      this.service.dialogs.alert(err, '提示', '确定');
    });
  }
  uploadFile(imageURI) {
    if (imageURI) {
      this.service.loadingStart();
      let url = this.service.ctxPath + "/file/upload";
      this.service.fileTransfer.upload(imageURI, encodeURI(url)).then(result => {
        this.service.loadingEnd();
        let res = eval("(" + result.response + ")");
        this.service.post('/v2/api/mobile/memberInfo/updateIcon', {
          icon: res.data[0].url
        }).then(sue => {
          this.service.getUserInfo();
        }, err => {
          console.log(err);
        })
      }, err => {
        this.service.loadingEnd();
        this.service.dialogs.alert(err, '提示', '确定');
      })
    }
  }
  changankaiqi(){
    this.cnum += 1;
    console.log(this.cnum)
  }
  shuangjitianjia(){
    if(this.cnum >= 3){
      let d_num: any = localStorage.getItem('choujiang_num');
      if (!d_num || d_num == '' || isNaN(d_num)) {
        d_num = 1;
      }
      else {
        d_num = parseInt(d_num) + 1;
      }
      localStorage.setItem('choujiang_num', d_num);
    }
  }
}
