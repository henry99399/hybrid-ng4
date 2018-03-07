import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../app/app.service';
import { BookInfoPage } from '../bookinfo/bookinfo';
import { LoginPage } from '../login/login';
import { CaogenInfoPage } from '../caogeninfo/caogeninfo';
@Component({
  selector: 'page-caogen',
  templateUrl: 'caogen.html'
})

export class CaogenPage {
  param: any = {
    pageNum: 0,
    pageSize: 24,
    type: 'all',
    isHubei: 1,
    book_type: 1
  }
  books: any = [];
  constructor(public navCtrl: NavController, private service: AppService) {

  }
  toinfo() {
    this.navCtrl.push(CaogenInfoPage);
  }
  dendai() {
    this.service.dialogs.alert('大赛还未开始，敬请期待~', '提示', '确认');
  }
  getPageData(infiniteScroll?: any) {
    if (!infiniteScroll) {
      this.service.loadingEnd();
    }
    this.param.pageNum += 1;
    this.service.post('/v3/api/search/bookList', this.param).then(success => {
      if (success.code == 600) {
        this.service.loadingEnd();
        this.navCtrl.push(LoginPage);
      }
      else if (success.code != 0) {
        this.service.loadingEnd();
        this.service.dialogs.alert(success.message, '提示', '确定');
      }
      else {
        success.data.rows.forEach(element => {
          this.books.push(element);
        });
        if (infiniteScroll) {
          infiniteScroll.complete();
        }
      }
    })
  }
  ionViewWillEnter() {
    this.service.statusBar.styleDefault();
  }
  //图书详情
  toBookInfo(book_id, book_type) {
    this.navCtrl.push(BookInfoPage, {
      book_id: book_id,
      book_type: book_type
    })
  }
  ionViewDidLoad() {
    this.service.loadingStart();
    this.getPageData();
  }
  doInfinite(infiniteScroll) {
    this.getPageData(infiniteScroll);
  }
}