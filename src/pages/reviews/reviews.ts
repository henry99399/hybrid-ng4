import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../app/app.service';
import { LoginPage } from '../login/login';

declare let jQuery: any;
@Component({
  selector: 'page-reviews',
  templateUrl: 'reviews.html'
})
export class ReviewsPage {
  param: any = {
    pageNum: 0,
    pages: 1,
    pageSize: 20
  }
  reviews: any = [];
  total: number = 0;
  df_checkbox: boolean = true;
  df_footer: boolean = true;
  constructor(public navCtrl: NavController, private service: AppService) {

  }
  getReviews(infiniteScroll?: any) {
    if (this.param.pageNum == 0) {
      this.service.loadingEnd();
    }
    if (this.param.pageNum < this.param.pages) {
      this.param.pageNum += 1;
    }
    this.service.post('/v3/member/memberReviewList', this.param).then(success => {
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
          this.reviews.push(element);
        });
        this.param.pages = success.data.pages;
        if (this.reviews.length == 0) {
          jQuery('.not-reviews-data').show();
        }
        else {
          jQuery('.not-reviews-data').hide();
        }
        if (infiniteScroll) {
          infiniteScroll.complete();
        }
        this.service.loadingEnd();
      }
    })
  }
  ngDoCheck() {
    if (this.reviews && this.reviews.length > 0) {
      this.total = 0;
      this.reviews.forEach(element => {
        if (element.select)
          this.total += 1;
      });
    }
  }
  changeAll() {
    this.df_checkbox = !this.df_checkbox;
    this.df_footer = this.df_checkbox;
  }
  clearAll() {
    let ids = [];
    this.reviews.forEach(element => {
      if (element.select)
        ids.push(element.review_id);
    });
    if (ids.length > 0) {
      this.service.post('/v3/bookReview/deleteReviews', {
        review_ids: ids.toString()
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
          this.reviews = [];
          this.total = 0;
          this.param.pageNum = 0;
          this.getReviews();
        }
      })
    }
    else {
      this.service.dialogs.alert('请选择你要删除的评论~', '提示', '确定');
    }
  }
  doInfinite(infiniteScroll) {
    this.getReviews(infiniteScroll);
  }
  ionViewWillEnter() {
    this.service.statusBar.styleDefault();
    this.service.loadingStart();
    this.getReviews();
  }
  formatMsgTime(timespan: string) {
    let dateTime = new Date(Date.parse(timespan.replace(/-/g, '/')));
    let year = dateTime.getFullYear();
    let month = dateTime.getMonth() + 1;
    let day = dateTime.getDate();
    let hour = dateTime.getHours();
    let minute = dateTime.getMinutes();
    //var second = dateTime.getSeconds();
    let now = new Date();
    let milliseconds = 0;
    let timeSpanStr;
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
}
