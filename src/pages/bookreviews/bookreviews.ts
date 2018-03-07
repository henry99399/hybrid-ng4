import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AppService } from '../../app/app.service';
import { SendReviewPage } from '../sendreview/sendreview';
import { LoginPage } from '../login/login';
@Component({
  selector: 'page-bookreviews',
  templateUrl: 'bookreviews.html'
})
export class BookReviewsPage {
  param: any = {
    pageNum: 0,
    pages: 1,
    total: 0,
    pageSize: 20,
    book_id: null,
    book_type: null
  }
  reviews: any = [];
  df_checkbox: boolean = true;
  df_footer: boolean = true;
  constructor(public navCtrl: NavController, private service: AppService, params: NavParams) {
    this.param.book_id = params.get('book_id');
    this.param.book_type = params.get('book_type');
  }
  getReviews(infiniteScroll?: any) {
    console.log(this.param.pageNum)
    if (this.param.pageNum == 0) {
      this.service.loadingEnd();
    }
    if (this.param.pageNum < this.param.pages) {
      this.param.pageNum += 1;
    }
    this.service.post('/v3/bookReview/list', this.param).then(success => {
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
        this.param.total = success.data.total;
        if (infiniteScroll) {
          infiniteScroll.complete();
        }
        this.service.loadingEnd();
      }
    })
  }
  //去评论
  toSendRie() {
    this.navCtrl.push(SendReviewPage, {
      book_id: this.param.book_id,
      book_type: this.param.book_type
    });
  }
  //点赞
  dianzhan(review: any) {
    this.service.post('/v3/bookReviewPraise/addReviewPraise', {
      review_id: review.review_id
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
        if (review.praise_id) {
          review.praise_id = null;
          review.praise_count -= 1;
        }
        else {
          review.praise_id = 1;
          review.praise_count += 1;
        }
      }
    })
  }
  doInfinite(infiniteScroll) {
    this.getReviews(infiniteScroll);
  }
  ionViewWillEnter() {
    this.service.statusBar.styleDefault();
    this.service.loadingStart();
    this.getReviews();
  }
  ngDoCheck() {
    if (this.service.updateBookInfoReviews) {
      this.service.updateBookInfoReviews = false;
      this.param.pageNum = 0;
      this.param.pages = 1;
      this.param.total = 0;
      this.reviews = [];
      this.service.loadingStart();
      this.getReviews();
    }
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
