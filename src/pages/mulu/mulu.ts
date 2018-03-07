import { Component } from '@angular/core';
import { NavController, NavParams, Tabs } from 'ionic-angular';
import { AppService } from '../../app/app.service';
import { LoginPage } from '../login/login';
import { RechargePage } from '../recharge/recharge';

declare let jQuery: any;
declare let navigator: any;
@Component({
  selector: 'page-mulu',
  templateUrl: 'mulu.html'
})
export class MuluPage {
  book_id: any;
  book_type: any;
  book_mulu: any;
  book: any;
  constructor(public navCtrl: NavController, params: NavParams, private service: AppService, private tab: Tabs) {
    this.book_id = params.get('book_id'); 
    this.book_type = params.get('book_type');
  }
  ionViewWillEnter() {
    this.service.statusBar.styleDefault();
  }
  //阅读
  selectBook(ch) {
    let options = {
      ctxPath: this.service.ctxPath.toString(),
      chid: (ch.id ? ch.id : ch.ch_id).toString(),
      pagenum: null,
      eventkey: null,
      bookid: this.book.book_id.toString(),
      bookname: this.book.book_name.toString(),
      booktype: this.book.book_type.toString(),
      userid: this.service.LoginUserInfo.member_id.toString(),
      token: this.service.LoginUserInfo.token.toString()
    }
    navigator.BookRead.reader(options)
  }
  ionViewDidLoad() {
    //声明阅读器回调方法
    jQuery.readePageBack = (name) =>{
      this.service.statusBar.styleDefault();
      if(name == 'login'){
        this.navCtrl.push(LoginPage);
      }
      else if(name == 'recharge'){
        this.navCtrl.push(RechargePage);
      }
      else if(name == 'bookshelf'){
        this.navCtrl.popToRoot();
        this.tab.select(0);
      }
    }
    if (this.book_type && this.book_id) {
      this.service.loadingStart();
      if (this.book_type == 2) {
        this.service.post('/v3/api/book/chapterTree', {
          book_id: this.book_id
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
            this.book_mulu = success.data.chapters;
            this.book = success.data.info;
            this.book.book_type = 2;
            this.service.loadingEnd();
          }
        })
      }
      else {
        this.service.post('/v3/bookChapter/list', {
          book_id: this.book_id
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
            this.book_mulu = success.data.chapters.chapters;
            this.book = success.data.info;
            this.book.book_type = 1;
            this.service.loadingEnd();
          }
        })
      }
    }
  }
}
