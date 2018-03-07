import { Component, ViewChild } from '@angular/core';
import { NavController, Slides, NavParams } from 'ionic-angular';
import { AppService } from '../../app/app.service';
import { ClassifyPage } from '../classify/classify';
import { BookInfoPage } from '../bookinfo/bookinfo';
import { LoginPage } from '../login/login';
declare let jQuery: any;
declare let Swiper: any;
@Component({
  selector: 'page-ycorder',
  templateUrl: 'ycorder.html'
})
export class YcOrderPage {
  active_index: number = 1;
  mySwiper: any;

  nv_order_data: any = [];
  nan_order_data: any = [];
  cb_order_data: any = [];

  nv_param: any = {
    pageNum: 0,
    pageSize: 10,
    pages: 1,
    type: 'popularity',
    bookChannel: 2
  }
  nan_param: any = {
    pageNum: 0,
    pageSize: 10,
    pages: 1,
    type: 'sale',
    bookChannel: 2
  }
  cb_param: any = {
    pageNum: 0,
    pageSize: 10,
    pages: 1,
    type: 'collection',
    bookChannel: 2
  }


  scroll_1: any;
  scroll_2: any;
  scroll_3: any;
  load_more_nv: boolean = true;
  load_more_nan: boolean = true;
  load_more_cb: boolean = true;

  @ViewChild(Slides) slides: Slides;
  constructor(public navCtrl: NavController, params: NavParams, private service: AppService) {
    this.nv_param.bookChannel = params.get('bookChannel');
    this.nan_param.bookChannel = params.get('bookChannel');
    this.cb_param.bookChannel = params.get('bookChannel');
  }
  ionViewWillEnter() {
    this.service.statusBar.styleDefault();
  }
  //切换频道
  activeTo(n: number, t: string) {
    this.active_index = n;
    this.mySwiper.slideTo(n - 1, 500, null);
  }
  //分类页
  toClassify(e?: any) {
    this.navCtrl.push(ClassifyPage);
  }
  //图书详情
  toBookInfo(book_id, book_type) {
    this.navCtrl.push(BookInfoPage, {
      book_id: book_id,
      book_type: book_type
    })
  }
  //获取人气周数据
  get_nv() {
    if (this.nv_param.pageNum < this.nv_param.pages) {
      this.nv_param.pageNum += 1;
      this.service.post('/v3/CJZWWBookList/channelRankList', this.nv_param).then(success => {
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
              jQuery('#mySwiper_order_1').animate({
                opacity: 1
              }, 'slow', () => {
                this.service.loadingEnd();
              });
            }, 500)

            this.scroll_1 = jQuery('#scroll_1').on('scroll', () => {
              let div = document.getElementById('scroll_1');
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
  //获取销售周榜
  get_nan() {
    if (this.nan_param.pageNum < this.nan_param.pages) {
      this.nan_param.pageNum += 1;
      this.service.post('/v3/CJZWWBookList/channelRankList', this.nan_param).then(success => {
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
            this.nan_order_data.push(element);
          });
          this.nan_param.pages = success.data.pages;
          this.load_more_nan = true;

          if (!this.scroll_2) {
            //关闭加载层
            setTimeout(() => {
              jQuery('#mySwiper_order_1').animate({
                opacity: 1
              }, 'slow', () => {
                this.service.loadingEnd();
              });
            }, 500)

            this.scroll_2 = jQuery('#scroll_2').on('scroll', () => {
              let div = document.getElementById('scroll_2');
              if (div.scrollHeight - div.scrollTop - div.clientHeight < 100) {
                if (this.load_more_nan && this.nan_param.pages > this.nan_param.pageNum) {
                  this.load_more_nan = false;
                  setTimeout(() => {
                    this.get_nan();
                  }, 500)
                }
              }
            });
          }
        }
      })
    }
  }

  //获取收藏周榜
  get_cb() {
    if (this.cb_param.pageNum < this.cb_param.pages) {
      this.cb_param.pageNum += 1;
      this.service.post('/v3/CJZWWBookList/channelRankList', this.cb_param).then(success => {
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
            this.cb_order_data.push(element);
          });
          this.cb_param.pages = success.data.pages;
          this.load_more_cb = true;
          if (!this.scroll_3) {
            //关闭加载层
            setTimeout(() => {
              jQuery('#mySwiper_order_1').animate({
                opacity: 1
              }, 'slow', () => {
                this.service.loadingEnd();
              });
            }, 500)

            this.scroll_3 = jQuery('#scroll_3').on('scroll', () => {
              let div = document.getElementById('scroll_3');
              if (div.scrollHeight - div.scrollTop - div.clientHeight < 100) {
                if (this.load_more_cb && this.cb_param.pages > this.cb_param.pageNum) {
                  this.load_more_cb = false;
                  setTimeout(() => {
                    this.get_cb();
                  }, 500)
                }
              }
            });
          }
        }
      })
    }
  }


  ionViewDidLoad() {
    this.service.loadingStart();
    this.mySwiper = new Swiper('#mySwiper_order_1', {
      onTransitionEnd: (swiper) => {
        let currentIndex = swiper.activeIndex;
        this.active_index = currentIndex + 1;
      }
    })
    //先加载一次
    this.get_nv();
    this.get_nan();
    this.get_cb();
  }
}
