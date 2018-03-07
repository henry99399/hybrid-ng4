import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../app/app.service';
import { SearchPage } from '../search/search';
import { XianmianPage } from '../xianmian/xianmian';
import { RechargePage } from '../recharge/recharge';
import { CaogenPage } from '../caogen/caogen';
import { LoginPage } from '../login/login';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
@Component({
  selector: 'page-find',
  templateUrl: 'find.html'
})
export class FindPage {
  constructor(public navCtrl: NavController, private barcodeScanner: BarcodeScanner, private service: AppService) {

  }
  ionViewWillEnter() {
    this.service.statusBar.styleDefault();
  }
  //前往搜索
  toSearch() {
    this.navCtrl.push(SearchPage);
  }
  tocaogen() {
    if (this.service.getNetEork()  == 'none') {
      this.service.dialogs.alert('网络异常，请检查你的网络状态正常后再试!', '提示', '确定');
      return false;
    }
    this.navCtrl.push(CaogenPage);
  }
  toxianmian() {
    if (this.service.getNetEork()  == 'none') {
      this.service.dialogs.alert('网络异常，请检查你的网络状态正常后再试!', '提示', '确定');
      return false;
    }
    this.navCtrl.push(XianmianPage);
  }
  tochongzhi() {
    if (this.service.getNetEork()  == 'none') {
      this.service.dialogs.alert('网络异常，请检查你的网络状态正常后再试!', '提示', '确定');
      return false;
    }
    this.navCtrl.push(RechargePage);
  }
  //扫码加书
  saomaAddBook() {
    if (this.service.getNetEork()  == 'none') {
      this.service.dialogs.alert('网络异常，请检查你的网络状态正常后再试!', '提示', '确定');
      return false;
    }
    this.service.dialogs.alert('您正在使用扫码加书功能，请将摄像头对准图书二维码', '温馨提示', '确定').then(() => {
      this.barcodeScanner.scan().then((success) => {
        if (success.text) {
          let search = success.text.split('?')[1];
          let searchs = search.split('&');
          let param = {
            org_id: null,
            book_id: null,
            device_id: null,
            book_type: null
          }
          for (var key in searchs) {
            if (searchs[key].indexOf('o=') != -1) {
              param['org_id'] = searchs[key].replace('o=', '');
            }
            if (searchs[key].indexOf('b=') != -1) {
              param['book_id'] = searchs[key].replace('b=', '');
            }
            if (searchs[key].indexOf('d=') != -1) {
              param['device_id'] = searchs[key].replace('d=', '');
            }
            if (searchs[key].indexOf('t=') != -1) {
              param['book_type'] = searchs[key].replace('t=', '');
            }
          }
          if (param.org_id && param.book_id) {
            //添加到书架
            this.service.post('/v2/api/bookShelf/addBook', param).then(success => {
              if (success.code == 600) {
                this.navCtrl.push(LoginPage);
              }
              else if (success.code == 0) {
                //重新获取书架内容
                this.service.unRefreshBookshelf = true;
                this.navCtrl.parent.select(0);
              }
              else {
                this.service.dialogs.alert(success.message, '提示', '确定');
              }
            })
          }
          else {
            this.service.dialogs.alert('你扫描的二维码有误，请确认后再试!');
          }
        }
      }, (error) => {
        this.service.dialogs.alert(error, '提示', '确定');
      })
    })
  }
}
