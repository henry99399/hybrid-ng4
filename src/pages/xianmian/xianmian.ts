import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Slides } from 'ionic-angular';
import { AppService } from '../../app/app.service';
import { ClassifyPage } from '../classify/classify';
import { BookInfoPage } from '../bookinfo/bookinfo';
import { LoginPage } from '../login/login';
declare let jQuery: any;
declare let Swiper: any;
@Component({
  selector: 'page-xianmian',
  templateUrl: 'xianmian.html'
})
export class XianmianPage {
  active_index: number = 1;
  mySwiper: any;

  nv_order_data: any = [];
  nan_order_data: any = [];
  cb_order_data: any = [];

  nv_param: any = {
    channel_type: 2,
    pageNum: 0,
    pageSize: 10,
    pages: 1
  }
  nan_param: any = {
    channel_type: 1,
    pageNum: 0,
    pageSize: 10,
    pages: 1
  }
  cb_param: any = {
    channel_type: 3,
    pageNum: 0,
    pageSize: 10,
    pages: 1
  }


  scroll_1: any;
  scroll_2: any;
  scroll_3: any;
  load_more_nv: boolean = true;
  load_more_nan: boolean = true;
  load_more_cb: boolean = true;
  df_type: number = 1;
  @ViewChild(Slides) slides: Slides;
  constructor(public navCtrl: NavController, public params: NavParams, private service: AppService) {
    this.df_type = parseInt(params.get('type'))
  }
  ionViewWillEnter() {
    this.service.statusBar.styleDefault();
  }
  //切换频道
  activeTo(n: number) {
    this.active_index = n;
    this.mySwiper.slideTo(n - 1, 500, null)
  }
  //分类页
  toClassify(e?: any) {
    this.navCtrl.push(ClassifyPage);
  }

  //获取人气周数据
  get_nv() {
    if (this.nv_param.pageNum < this.nv_param.pages) {
      this.nv_param.pageNum += 1;
      this.service.post('/v3/api/bookDiscount/getList', this.nv_param).then(success => {
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
          if (this.nv_order_data.length == 0) {
            jQuery('.page-notdata-1').show();
          }
          else {
            jQuery('.page-notdata-1').hide();
          }
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
      this.service.post('/v3/api/bookDiscount/getList', this.nan_param).then(success => {
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
          if (this.nan_order_data.length == 0) {
            jQuery('.page-notdata-2').show();
          }
          else {
            jQuery('.page-notdata-2').hide();
          }
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
      this.service.post('/v3/api/bookDiscount/getList', this.cb_param).then(success => {
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
          if (this.cb_order_data.length == 0) {
            jQuery('.page-notdata-3').show();
          }
          else {
            jQuery('.page-notdata-3').hide();
          }
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
      this.mySwiper = new Swiper('#mySwiper_order_1', {
        onTransitionEnd: (swiper) => {
          let currentIndex = swiper.activeIndex;
          this.active_index = currentIndex + 1;
        }
      })
      //跳转到默认模块
      this.activeTo(this.df_type);
      //先加载一次
      this.get_nv();
      this.get_nan();
      this.get_cb();
    }
  }
}
