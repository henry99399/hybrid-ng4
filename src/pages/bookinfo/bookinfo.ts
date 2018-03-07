import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content, Tabs } from 'ionic-angular';
import { AppService } from '../../app/app.service';
import { MuluPage } from '../mulu/mulu';
import { BookReviewsPage } from '../bookreviews/bookreviews';
import { SendReviewPage } from '../sendreview/sendreview';
import { LoginPage } from '../login/login';
import { RechargePage } from '../recharge/recharge';

declare let navigator: any;
declare let jQuery: any;
declare let Wechat: any;
declare let QQSDK: any;
declare let WeiboSDK: any;
@Component({
  selector: 'page-bookinfo',
  templateUrl: 'bookinfo.html'
})
export class BookInfoPage {
  book: any;
  books: any;
  book_id: any;
  book_type: any;
  mulu_count: 0;
  review_list: any = {
    pages: 0,
    rows: []
  };
  shouchang: boolean = false;
  time_text: any;
  @ViewChild(Content) content: Content;
  constructor(public navCtrl: NavController, public service: AppService, public params: NavParams, private tab: Tabs) {
    this.book_id = this.params.get('book_id');
    this.book_type = this.params.get('book_type');
  }
  fxaddData() {
    this.service.post('/v3/bookShare/addBookIndexRecord', {
      book_id: this.book_id,
      book_type: this.book_type
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
        this.service.dialogs.alert('分享成功!', '提示', '确定');
      }
    })
  }
  //分享到qq
  fxqq() {
    let args: any = {};
    args.client = QQSDK.ClientType.QQ;//QQSDK.ClientType.QQ,QQSDK.ClientType.TIM;
    QQSDK.checkClientInstalled(() => {
      args.scene = QQSDK.Scene.QQ;//QQSDK.Scene.QQZone,QQSDK.Scene.Favorite
      args.url = this.book_type == 1 ? 'http://m.cjzww.com/book/index.php?bkid=' + this.book_id : 'http://cjzww.cjszyun.cn/mobile/bookInfo/' + this.book_id;
      args.title = "我的快乐，与你共享《" + this.book.book_name.trim() + "》";
      args.description = this.book.book_remark.trim();
      args.image = this.book_type == 1 ? this.book.book_cover : this.service.ctxPath + this.book.book_cover_small;
      QQSDK.shareNews(() => {
        this.fxaddData();
      }, (failReason) => {
        console.log(failReason);
      }, args);
    }, (err) => {
      this.service.dialogs.alert('你的手机还没有安装QQ呢!', '提示', '确定');
    }, args);
  }
  //分享到微博
  fxweibo() {
    WeiboSDK.checkClientInstalled(() => {
      let args: any = {};
      args.url = this.book_type == 1 ? 'http://m.cjzww.com/book/index.php?bkid=' + this.book_id : 'http://cjzww.cjszyun.cn/mobile/bookInfo/' + this.book_id;
      args.title = "我的快乐，与你共享《" + this.book.book_name.trim() + "》";
      args.description = this.book.book_remark.trim();
      args.image = this.book_type == 1 ? this.book.book_cover : this.service.ctxPath + this.book.book_cover_small;
      WeiboSDK.shareToWeibo((scene) => {
        this.fxaddData();
      }, (failReason) => {
        // console.log(failReason);
      }, args);
    }, (err) => {
      this.service.dialogs.alert('你的手机还没有安装微博呢!', '提示', '确定');
    });
  }
  //分享到微信
  fxtoweixin() {
    if (Wechat) {
      Wechat.isInstalled((s) => {
        Wechat.share({
          message: {
            title: "我的快乐，与你共享《" + this.book.book_name.trim() + "》",
            description: this.book.book_remark.trim(),
            thumb: this.book_type == 1 ? this.book.book_cover : this.service.ctxPath + this.book.book_cover_small,
            mediaTagName: "TEST-TAG-001",
            messageExt: this.book.book_remark.trim(),
            messageAction: "<action>dotalist</action>",
            media: {
              type: Wechat.Type.WEBPAGE,
              webpageUrl: this.book_type == 1 ? 'http://m.cjzww.com/book/index.php?bkid=' + this.book_id : 'http://cjzww.cjszyun.cn/mobile/bookInfo/' + this.book_id
            }
          },
          scene: Wechat.Scene.SESSION
        }, () => {
          this.fxaddData();
        }, (reason) => {
          //this.service.dialogs.alert('错误:' + reason, '提示', '确定');
        });
      }, (e) => {
        this.service.dialogs.alert('你的手机还没有安装微信呢!', '提示', '确定');
      })
    }
  }
  //分享到朋友圈
  fxtopengyouquan() {
    if (Wechat) {
      Wechat.isInstalled((s) => {
        Wechat.share({
          message: {
            title: "我的快乐，与你共享《" + this.book.book_name.trim() + "》",
            description: this.book.book_remark.trim(),
            thumb: this.book_type == 1 ? this.book.book_cover : this.service.ctxPath + this.book.book_cover_small,
            mediaTagName: "TEST-TAG-001",
            messageExt: this.book.book_remark.trim(),
            messageAction: "<action>dotalist</action>",
            media: {
              type: Wechat.Type.WEBPAGE,
              webpageUrl: this.book_type == 1 ? 'http://m.cjzww.com/book/index.php?bkid=' + this.book_id : 'http://cjzww.cjszyun.cn/mobile/bookInfo/' + this.book_id
            }
          },
          scene: Wechat.Scene.TIMELINE
        }, () => {
          this.fxaddData();
        }, (reason) => {
          //this.service.dialogs.alert('错误:' + reason, '提示', '确定');
        });
      }, (e) => {
        this.service.dialogs.alert('你的手机还没有安装微信呢!', '提示', '确定');
      })
    }
  }
  //去评论
  toSendRie() {
    this.navCtrl.push(SendReviewPage, {
      book_id: this.book_id,
      book_type: this.book_type
    });
  }
  //所有评论
  toBookReviewsPage() {
    this.navCtrl.push(BookReviewsPage, {
      book_id: this.book_id,
      book_type: this.book_type
    })
  }
  //分享
  toFenxiang(event: any) {
    jQuery('.footer-fx').fadeIn();
    setTimeout(function () {
      jQuery('.footer-fx').bind('click', function () {
        jQuery('.footer-fx').fadeOut();
        jQuery('.footer-fx').unbind('click');
      })
    }, 500);
  }
  //收藏
  toShouchang() {
    jQuery('.ol-1').hide();
    jQuery('.ol-2').show();
    this.service.loadingStart('正在更新书架');
    this.service.post('/v3/api/bookShelf/addBook', {
      book_id: this.book_id,
      book_type: this.book_type
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
        setTimeout(() => {
          this.service.loadingEnd();
          this.service.unRefreshBookshelf = true;
          this.service.dialogs.confirm('图书已放进你的书架了, 现在就去阅读吧!', '提示', ['进入书架', '我再看看']).then(index => {
            if (index == 1) {
              this.tab.select(0);
              this.navCtrl.popToRoot();
            }
          });
        }, 500)
      }
    })
  }
  //目录
  tomulu() {
    this.navCtrl.push(MuluPage, {
      book_id: this.book_id,
      book_type: this.book_type
    })
  }
  //评论
  getReviws() {
    this.service.post('/v3/bookReview/list', {
      book_id: this.book_id,
      book_type: this.book_type,
      pageNum: 1,
      pageSize: 5
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
        this.review_list = success.data;
      }
    })
  }
  updatewifi() {
    if (this.service.getNetEork()  == 'none') {
      jQuery('.page-notwork').show();
      jQuery('.has-wifi').hide();
    }
    else {
      jQuery('.page-notwork').hide();
      jQuery('.has-wifi').show();
      this.Infinity_page(this.book_id, this.book_type);
    }
  }
  ionViewWillLeave() {
    clearTimeout(navigator.book_tiger);
  }

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
    clearTimeout(navigator.book_tiger);
    if (this.service.getNetEork()  == 'none') {
      jQuery('.page-notwork').show();
      jQuery('.has-wifi').hide();
    }
    else {
      this.service.loadingStart();
      this.service.post('/v3/book/getBookDetailInfo', {
        book_id: this.book_id,
        book_type: this.book_type
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
          this.book = success.data;
          if (this.book.discount_price && this.book.discount_price > 0) {
            this.book.discount_price = parseInt((this.book.discount_price * 100).toFixed(0));
          }
          if (this.book.price && this.book.price > 0) {
            this.book.price = parseInt((this.book.price * 100).toFixed(0));
          }
          //简介计算
          if (this.book.book_remark) {
            let nn: number = Math.round(this.book.book_remark.length / (document.body.clientWidth - 32) * 10 + 1);
            if (nn > 3) {
              this.book.showMoreAction = true;
            }
          }
          if (success.data.end_time)
            this.leftTimer(success.data.end_time)
          if (this.book.shelf_id) {
            jQuery('.ol-1').hide();
            jQuery('.ol-2').show();
          }
          if (this.book_type == 2) {
            this.service.post('/v2/api/mobile/book/listSuggest', {
              org_id: 189,
              bookCatId: this.book.book_cat_id,
              bookId: this.book_id,
              num: 12
            }).then(data => {
              if (data.code != 0) {
                this.service.dialogs.alert(data.message, '提示', '确定');
              }
              else {
                this.books = data.data;
              }
            })
          }
          else {
            this.service.post('/v3/recommend/list', {
              book_id: this.book_id,
              book_type: this.book_type,
              limit: 12
            }).then(data => {
              if (data.code == 600) {
                this.navCtrl.push(LoginPage);
              }
              else if (data.code != 0) {
                this.service.dialogs.alert(data.message, '提示', '确定');
              }
              else {
                this.books = data.data;
              }
            })
          }
        }
      })
      this.service.post('/v3/bookChapter/chapterCount', {
        book_id: this.book_id,
        book_type: this.book_type
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
          this.mulu_count = success.data;
          this.service.loadingEnd();
        }
      })
      this.getReviws();
    }
    //事件绑定
    jQuery('.fx-content').click(function () {
      return false;
    })
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
        this.getReviws();
      }
    })
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
  //重新更新 图书信息
  Infinity_page(book_id: any, book_type: any) {
    this.content.scrollToTop();
    this.book_id = book_id;
    this.book_type = book_type ? book_type : 2;

    this.service.loadingStart();
    this.service.post('/v3/book/getBookDetailInfo', {
      book_id: this.book_id,
      book_type: this.book_type
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
        this.book = success.data;
        if (this.book.discount_price && this.book.discount_price > 0) {
          this.book.discount_price = parseInt((this.book.discount_price * 100).toFixed(0));
        }
        if (this.book.price && this.book.price > 0) {
          this.book.price = parseInt((this.book.price * 100).toFixed(0));
        }

        //简介计算
        if (this.book.book_remark) {
          let nn: number = Math.round(this.book.book_remark.length / (document.body.clientWidth - 32) * 10 + 1);
          if (nn > 3) {
            this.book.showMoreAction = true;
          }
        }
        if (success.data.end_time)
          this.leftTimer(success.data.end_time)

        if (this.book.shelf_id) {
          jQuery('.ol-1').hide();
          jQuery('.ol-2').show();
        }
        else{
          jQuery('.ol-1').show();
          jQuery('.ol-2').hide();
        }
        if (this.book_type == 2) {
          this.service.post('/v2/api/mobile/book/listSuggest', {
            org_id: 189,
            bookCatId: this.book.book_cat_id,
            bookId: this.book_id,
            num: 12
          }).then(data => {
            if (data.code == 600) {
              this.service.loadingEnd();
              this.navCtrl.push(LoginPage);
            }
            else if (data.code != 0) {
              this.service.loadingEnd();
              this.service.dialogs.alert(data.message, '提示', '确定');
            }
            else {
              this.books = data.data;
            }
          })
        }
        else {
          this.service.post('/v3/recommend/list', {
            book_id: this.book_id,
            book_type: this.book_type,
            limit: 12
          }).then(data => {
            if (data.code == 600) {
              this.navCtrl.push(LoginPage);
            }
            else if (data.code != 0) {
              this.service.dialogs.alert(data.message, '提示', '确定');
            }
            else {
              this.books = data.data;
            }
          })
        }
      }
    })
    this.service.post('/v3/bookChapter/chapterCount', {
      book_id: this.book_id,
      book_type: this.book_type
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
        this.mulu_count = success.data;
        this.service.loadingEnd();
      }
    })
    this.getReviws();
  }

  ngDoCheck() {
    if (this.service.updateBookInfoReviews) {
      this.service.updateBookInfoReviews = false;
      this.getReviws();
    }
  }
  leftTimer(time: string) {
    if (time) {
      let leftTime: number = new Date(Date.parse(time.replace(/-/g, '/'))).getTime() - (new Date()).getTime();
      let days = parseInt((leftTime / 1000 / 60 / 60 / 24).toString(), 10); //计算剩余的天数 
      let hours = parseInt((leftTime / 1000 / 60 / 60 % 24).toString(), 10); //计算剩余的小时 
      let minutes = parseInt((leftTime / 1000 / 60 % 60).toString(), 10);//计算剩余的分钟 
      let seconds = parseInt((leftTime / 1000 % 60).toString(), 10);//计算剩余的秒数 
      days = this.checkTime(days);
      hours = this.checkTime(hours);
      minutes = this.checkTime(minutes);
      seconds = this.checkTime(seconds);
      if (days.toString() != '00') {
        this.time_text = days + "天" + hours + "小时" + minutes + "分" + seconds + "秒"
      }
      else {
        this.time_text = hours + "小时" + minutes + "分" + seconds + "秒"
      }
      clearTimeout(navigator.book_tiger);
      if (days > 0 || hours > 0 || minutes > 0 || seconds > 0) {
        navigator.book_tiger = setTimeout(() => {
          this.leftTimer(time);
        }, 1000);
      }
    }
  }
  checkTime(i) { //将0-9的数字前面加上0，例1变为01 
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }
  //阅读
  selectBook() {
    let options = {
      ctxPath: this.service.ctxPath.toString(),
      chid: null,
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
}
