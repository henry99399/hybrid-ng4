import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AppService } from '../../app/app.service';
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-sendreview',
  templateUrl: 'sendreview.html'
})
export class SendReviewPage {
  review_content: any;
  book_id: any;
  book_type: any;
  pid: any;
  constructor(public navCtrl: NavController, params: NavParams, private service: AppService) {
    this.book_id = params.get('book_id');
    this.book_type = params.get('book_type');
  }
  ionViewWillEnter() {
    this.service.statusBar.styleDefault();
  }
  submitView() {
    if (this.review_content) {
      this.service.post('/v3/bookReview/addReview', {
        book_id: this.book_id,
        review_content: this.review_content,
        book_type: this.book_type,
        pis: null
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
          this.service.updateBookInfoReviews = true;
          this.service.dialogs.alert('评论成功!', '提示', '确定').then(() => {
            this.navCtrl.pop();
          });
        }
      })
    }
    else {
      this.service.dialogs.alert('你还没有填写评论内容!', '提示', '确定');
    }
  }
}
