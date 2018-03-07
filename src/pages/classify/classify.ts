import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../app/app.service';
import { LoginPage } from '../login/login';
import { ClassifyListPage } from '../classifylist/classifylist';

declare let jQuery: any;
@Component({
  selector: 'page-classify',
  templateUrl: 'classify.html'
})
export class ClassifyPage {

  mcType: string = 'nv';
  c_nv: any;
  c_nan: any;
  c_cb: any;
  constructor(public navCtrl: NavController, private service: AppService) {

  }
  ionViewWillEnter() {
    this.service.statusBar.styleDefault();
  }
  //获取分类
  get_ClassList(type) {
    this.service.post('/v3/api/bookCat/repoList', {
      pid: null,
      channel: type
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
        if (type == 0) {
          this.c_nv = success.data;
        }
        if (type == 1) {
          this.c_nan = success.data;
        }
        if (type == 2) {
          this.c_cb = success.data;
        }
      }
    })
  }
  toClassifyList(id: string, name: string, bookChannel: string) {
    this.navCtrl.push(ClassifyListPage, {
      id: id,
      name: name,
      bookChannel: bookChannel
    })
  }
  ionViewDidLoad() {
    if (this.service.getNetEork()  == 'none') {
      jQuery('.page-notwork').show();
      jQuery('.has-wifi').hide();
    }
    else {
      jQuery('.page-notwork').hide();
      jQuery('.has-wifi').show();

      this.get_ClassList(0);
      this.get_ClassList(1);
      this.get_ClassList(2);
    }
  }

  set_class(tt) {
    this.mcType = tt;
  }
}
