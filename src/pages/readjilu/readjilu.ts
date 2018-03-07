import { Component } from '@angular/core';
import { NavController, Tabs} from 'ionic-angular';
import { AppService } from '../../app/app.service';
import { LoginPage } from '../login/login';
import { RechargePage } from '../recharge/recharge';

declare let jQuery: any;
declare let navigator: any;
@Component({
  selector: 'page-readjilu',
  templateUrl: 'readjilu.html'
})
export class ReadJiluPage {
  param: any = {
    pageNum: 0,
    pages: 1,
    pageSize: 10
  }
  jilu: any = [];
  constructor(public navCtrl: NavController, private service: AppService, private tab: Tabs) {

  }


  //阅读
  selectBook(book) {
    let options = {
      ctxPath: this.service.ctxPath.toString(),
      chid: book.chapter_id.toString(),
      pagenum: null,
      eventkey: null,
      bookid: book.book_id.toString(),
      bookname: book.book_name.toString(),
      booktype: book.book_type.toString(),
      userid: this.service.LoginUserInfo.member_id.toString(),
      token: this.service.LoginUserInfo.token.toString()
    }
    navigator.BookRead.reader(options)
  }
  getjilu(infiniteScroll?: any) {
    if (this.param.pageNum == 0) {
      this.service.loadingEnd();
    }
    if (this.param.pageNum < this.param.pages) {
      this.param.pageNum += 1;
    }
    this.service.post('/v3/memberRead/updateReadRecord', this.param).then(success => {
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
          let jd = element.schedule;
          if(jd && jd.toString().indexOf('|') != -1){
            element.baifen = parseFloat(jd.toString().split('|')[1]).toFixed(2);
          }
          this.jilu.push(element);
        });
        if (this.jilu.length == 0) {
          jQuery('.not-reviews-data').show();
        }
        else {
          jQuery('.not-reviews-data').hide();
        }
        this.param.pages = success.data.pages;
        if (infiniteScroll) {
          infiniteScroll.complete();
        }
        this.service.loadingEnd();
      }
    })
  }
  clearAll() {
    this.service.dialogs.confirm('你确定要清除所有阅读记录吗?', '提示', ['确定', '取消']).then(index => {
      if (index == 1) {
        this.service.post('/v2/api/book/deleteReadRecord').then(success => {
          this.jilu = [];
        })
      }
    })
  }
  doInfinite(infiniteScroll) {
    this.getjilu(infiniteScroll);
  }
  formatMsgTime(timespan: string) {
    let dateTime = new Date(Date.parse(timespan.replace(/-/g, '/')));
    var year = dateTime.getFullYear();
    var month = dateTime.getMonth() + 1;
    var day = dateTime.getDate();
    var hour = dateTime.getHours();
    var minute = dateTime.getMinutes();
    //var second = dateTime.getSeconds();
    var now = new Date();
    var milliseconds = 0;
    var timeSpanStr;
    milliseconds = now.getTime() - dateTime.getTime();
    if (milliseconds <= 1000 * 60 * 1) {
      timeSpanStr = '刚刚';
    }
    else if (1000 * 60 * 1 < milliseconds && milliseconds <= 1000 * 60 * 60) {
      timeSpanStr = Math.round((milliseconds / (1000 * 60))) + '分钟前';
    }
    else if (1000 * 60 * 60 * 1 < milliseconds && milliseconds <= 1000 * 60 * 60 * 24) {
      timeSpanStr = Math.round(milliseconds / (1000 * 60 * 60)) + '小时前';
    }
    else if (1000 * 60 * 60 * 24 < milliseconds && milliseconds <= 1000 * 60 * 60 * 24 * 15) {
      timeSpanStr = Math.round(milliseconds / (1000 * 60 * 60 * 24)) + '天前';
    }
    else if (milliseconds > 1000 * 60 * 60 * 24 * 15 && year == now.getFullYear()) {
      timeSpanStr = month + '-' + day + ' ' + hour + ':' + minute;
    } else {
      timeSpanStr = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
    }
    return timeSpanStr;
  };
  ionViewWillEnter() {
    this.service.statusBar.styleDefault();
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
    this.service.loadingStart();
    this.getjilu();
  }
}
