import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AppService } from '../../app/app.service';
import { BookInfoPage } from '../bookinfo/bookinfo';
import { LoginPage } from '../login/login';
declare let jQuery: any;
@Component({
  selector: 'page-classifylist',
  templateUrl: 'classifylist.html'
})
export class ClassifyListPage {
  pageName: string;
  classifyArray: any;
  param: any = {
    pageNum: 0,
    pageSize: 10,
    pages: 1,
    total: 0,

    book_cat_id: 0,
    book_cat_sonid: null,
    bookChannel: null,
    book_type: 1,
    type: 'all',
    order: null
  }
  cat_id: null;
  scroll_1: any;
  load_more: boolean = true;
  book_list_data: any = [];
  constructor(public navCtrl: NavController, public params: NavParams, private service: AppService) {
    console.log(params)
    this.pageName = params.get('name');

    this.param.book_cat_id = params.get('id');
    this.cat_id = params.get('id');
    this.param.bookChannel = params.get('bookChannel');
    if (this.param.bookChannel == '2') {
      this.param.book_type = 2;
    }
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
    if (this.service.getNetEork()  == 'none') {
      jQuery('.page-notwork').show();
      jQuery('.has-wifi').hide();
    }
    else {
      jQuery('.page-notwork').hide();
      jQuery('.has-wifi').show();
      this.service.loadingStart();
      this.service.post('/v3/api/bookCat/repoList', {
        pid: this.param.book_cat_id,
        channel: this.param.bookChannel
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
          this.classifyArray = success.data;
          this.getBookList();
          this.service.loadingEnd();
        }
      });
      this.scroll_1 = jQuery('#scroll_1').on('scroll', () => {
        let div = document.getElementById('scroll_1');
        if (div.scrollHeight - div.scrollTop - div.clientHeight < 100) {
          if (this.param.pages > this.param.pageNum && this.load_more) {
            this.load_more = false;
            this.getBookList();
          }
        }
      });
    }
  }
  //数据加载
  getBookList(key?: any, value?: any) {
    if (key) {
      this.param[key] = value;
      this.param.pages = 1;
      this.param.pageNum = 0;
      this.book_list_data = [];
    }
    if (this.param.pageNum >= this.param.pages) {
      return false;
    }
    if (this.param.book_type == 2) {
      this.param.book_cat_id = this.param.book_cat_sonid ? this.param.book_cat_sonid : this.cat_id;
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
          this.book_list_data.push(element);
        });
        this.param.pages = success.data.pages;
        this.param.total = success.data.total;
        this.load_more = true;
      }
    })
  }
}
