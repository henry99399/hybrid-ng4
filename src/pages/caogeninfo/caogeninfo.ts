import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../app/app.service';
@Component({
  selector: 'page-caogeninfo',
  templateUrl: 'caogeninfo.html'
})

export class CaogenInfoPage {
  constructor(public navCtrl: NavController, private service: AppService) {

  }
  backPage(){
    this.navCtrl.pop();
  }
  ionViewWillEnter() {
    this.service.statusBar.styleDefault();
  }
}