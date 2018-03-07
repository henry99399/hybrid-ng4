import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../app/app.service';
@Component({
  selector: 'page-qiandaoremark',
  templateUrl: 'qiandaoremark.html'
})
export class QiandaoRemarkPage {

  constructor(public navCtrl: NavController, private service: AppService) {

  }
  ionViewWillEnter() {
    this.service.statusBar.styleDefault();
  }
}
