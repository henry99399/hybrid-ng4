import { Component, ViewChild } from '@angular/core';
import { NavController, Slides } from 'ionic-angular';
import { AppService } from '../../app/app.service';
import { BookInfoPage } from '../bookinfo/bookinfo';
import { LoginPage } from '../login/login';
declare let jQuery: any;
@Component({
  selector: 'page-cbhotbook',
  templateUrl: 'cbhotbook.html'
})
export class CbHotBookPage {
  active_index: number = 1;
  nv_order_data: any = [];

  nv_param: any = {
    order: 'hot',
    pageNum: 0,
    pageSize: 10,
    pages: 1
  }

  scroll_1: any;
  load_more_nv: boolean = true;
  @ViewChild(Slides) slides: Slides;
  constructor(public navCtrl: NavController, private service: AppService) {

  }

  ionViewWillEnter() {
    this.service.statusBar.styleDefault();
  }
  //获取人气周数据
  get_nv() {
    if (this.nv_param.pageNum < this.nv_param.pages) {
      this.nv_param.pageNum += 1;
      this.service.post('/v3/api/search/bookList', this.nv_param).then(success => {
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
            this.nv_order_data.push(element);
          });
          this.nv_param.pages = success.data.pages;
          this.load_more_nv = true;
          if (!this.scroll_1) {
            //关闭加载层
            setTimeout(() => {
              jQuery('#scroll_nv').animate({
                opacity: 1
              }, 'slow', () => {
                this.service.loadingEnd();
              });
            }, 500)
            this.scroll_1 = jQuery('#scroll_nv').on('scroll', () => {
              let div = document.getElementById('scroll_nv');
              if (div.scrollHeight - div.scrollTop - div.clientHeight < 100) {
                if (this.load_more_nv && this.nv_param.pages > this.nv_param.pageNum) {
                  this.load_more_nv = false;
                  setTimeout(() => {
                    this.get_nv();
                  }, 500)
                }
              }
            });
          }
        }
      })
    }
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
    //先加载一次
    this.get_nv();
  }
}
