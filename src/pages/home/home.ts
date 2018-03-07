import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NavController, Content, Tabs } from 'ionic-angular';
import { AppService } from '../../app/app.service';
import { QiandaoPage } from '../qiandao/qiandao';
import { SearchPage } from '../search/search';
import { LoginPage } from '../login/login';
import { BookInfoPage } from '../bookinfo/bookinfo';
import { RechargePage } from '../recharge/recharge';


import { BarcodeScanner } from '@ionic-native/barcode-scanner';
declare let navigator: any;
declare let IScroll: any;
declare let jQuery: any;
declare let cordova: any;
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  hotBook: any; //头部推荐
  shlefBook: any; //书架
  toDayTime: string; //今日日期
  unExecHttpService: boolean = true; //是否允许再次刷新书架
  updateShelf: boolean = false; //是否处于编辑书架状态
  my_refresh: boolean = false; //自己刷新
  hiddenTop: boolean = false; // 是否隐藏头部
  myScroll: any;
  topHeight: number;
  header_blank: any;
  home_header: any;
  myScroll_Y: number = 0; //滚动条初始值
  pageHome_bg: any; //背景
  updateCount: number = -1; //更新数量

  show_sing_in: 1; //是否需要签到
  unbarcodeScanner: boolean = true; //限制扫码
  @ViewChild(Content) content: Content;
  constructor(public navCtrl: NavController,
    private barcodeScanner: BarcodeScanner,
    private service: AppService, private ref: ChangeDetectorRef, private tab: Tabs) {
    let date = new Date();
    let month: any = date.getMonth() + 1;
    month = month < 10 ? '0' + month : month;
    let day: any = date.getDate();
    day = day < 10 ? '0' + day : day;
    this.toDayTime = date.getFullYear() + '-' + month + '-' + day;
  }
  //去书城
  tocity() {
    this.tab.select(1);
  }
  //前往签到
  toqiandao() {
    this.navCtrl.push(QiandaoPage);
  }
  // //前往搜索
  toSearch() {
    this.navCtrl.push(SearchPage);
  }
  //扫码加书
  saomaAddBook() {
    if (!this.unbarcodeScanner)
      return false;
    this.unbarcodeScanner = false;
    if (this.service.getNetEork() == 'none') {
      this.service.dialogs.alert('网络异常，请检查你的网络状态正常后再试!', '提示', '确定');
      return false;
    }
    this.service.dialogs.alert('您正在使用扫码加书功能，请将摄像头对准图书二维码', '温馨提示', '确定').then(() => {
      this.barcodeScanner.scan().then((success) => {
        this.unbarcodeScanner = true;
        if (success.text) {
          let search = success.text.split('?')[1];
          let searchs = search.split('&');
          let param = {
            org_id: null,
            book_id: null,
            device_id: null,
            book_type: null
          }
          for (var key in searchs) {
            if (searchs[key].indexOf('o=') != -1) {
              param['org_id'] = searchs[key].replace('o=', '');
            }
            if (searchs[key].indexOf('b=') != -1) {
              param['book_id'] = searchs[key].replace('b=', '');
            }
            if (searchs[key].indexOf('d=') != -1) {
              param['device_id'] = searchs[key].replace('d=', '');
            }
            if (searchs[key].indexOf('t=') != -1) {
              param['book_type'] = searchs[key].replace('t=', '');
            }
          }
          if (param.org_id && param.book_id) {
            //添加到书架
            this.service.post('/v2/api/bookShelf/addBook', param).then(success => {
              if (success.code == 600) {
                this.navCtrl.push(LoginPage);
              }
              else if (success.code == 0) {
                //重新获取书架内容
                this.getShlefBook();
              }
              else {
                this.service.dialogs.alert(success.message, '提示', '确定');
              }
            })
          }
          else {
            this.service.dialogs.alert('你扫描的二维码有误，请确认后再试!', '提示', '确定');
          }
        }
      }, (error) => {
        this.service.dialogs.alert(error, '提示', '确定');
        this.unbarcodeScanner = true;
      })
    })
  }
  //删除图书
  deleteBook() {
    let ids = [];
    for (var index in this.shlefBook) {
      if (this.shlefBook[index].select) {
        ids.push(this.shlefBook[index].bk_id);
      }
    }
    if (this.service.getNetEork() == 'none') {
      this.service.dialogs.alert('网络异常，请检查你的网络状态正常后再试!', '提示', '确定');
      return false;
    }
    if (ids.length == 0) {
      this.service.dialogs.alert('你还未选择需要删除的图书！', '删除提示', '确定');
    }
    else {
      this.service.dialogs.confirm('你确定要删除这些图书吗?', '删除提示', ['确定', '取消']).then(index => {
        if (index == 1) {
          this.service.loadingStart();
          if (cordova) {
            this.service.post('/v2/api/bookShelf/delBook', { book_id: ids.toString() }).then(success => {
              if (success.code == 0) {
                let array = [];
                for (var iii = 0; iii < this.shlefBook.length; iii++) {
                  let book = this.shlefBook[iii];
                  if (book.select) {
                    this.service.ngFile.removeFile(this.service.savePath + 'files/cover/', book.coverName);
                    this.service.ngFile.removeRecursively(this.service.savePath + 'files/book/', book.epubName);
                  }
                  else {
                    array.push(book);
                  }
                }
                this.shlefBook = array;
                //重新存储
                localStorage.setItem('shlefBook', JSON.stringify(this.shlefBook));
                //全局更新
                this.ref.detectChanges();
                this.service.loadingEnd();
                if (array.length == 0) {
                  this.clearBookSelect();
                  jQuery('.add-find-book').show();
                }
                else {
                  jQuery('.add-find-book').hide();
                }
              }
              else {
                this.service.loadingEnd();
                this.service.dialogs.alert(success.message);
              }
            })
          }
        }
      })
    }
  }
  //选中图书
  selectBook(book) {
    if (this.updateShelf) {
      book.select = !book.select;
      this.ref.detectChanges();
    }
    else {
      let options = {
        ctxPath: this.service.ctxPath.toString(),
        chid: null,
        pagenum: null,
        eventkey: null,
        bookid: book.bk_id.toString(),
        bookname: book.bk_name.toString(),
        booktype: book.book_type.toString(),
        userid: this.service.LoginUserInfo.member_id.toString(),
        token: this.service.LoginUserInfo.token.toString()
      }
      navigator.BookRead.reader(options)
    }
  }
  //全选
  bookSelectAll() {
    for (var index in this.shlefBook) {
      this.shlefBook[index].select = true;
    }
    this.ref.detectChanges();
  }
  //取消
  clearBookSelect() {
    let bar: any = document.querySelector(".tabbar");
    bar.style.display = "";
    this.updateShelf = false;
    this.header_blank.css('opacity', 0);
    this.home_header.css('background', `rgba(255,255,255,0)`);
    this.service.statusBar.styleBlackTranslucent();
    setTimeout(() => {
      this.myScroll.refresh();
    }, 500);
  }
  //长按
  holdBook($event) {
    if (!this.updateShelf) {
      let event = $event || window.event;
      if (event && event.stopPropagation)
        event.stopPropagation();
      if (event && event.preventDefault)
        event.preventDefault();
      for (var index in this.shlefBook) {
        this.shlefBook[index].select = false;
      }
      this.ref.detectChanges();
      this.updateShelf = true;
      this.myScroll.scrollTo(0, 0, 0);
      let bar: any = document.querySelector(".tabbar");
      bar.style.display = "none";
      this.header_blank.css('opacity', 1);
      this.home_header.css('background', `rgba(255,255,255,1)`);
      this.service.statusBar.styleDefault();

      setTimeout(() => {
        this.myScroll.refresh();
      }, 600)
    }
  }
  //图书详情
  toBookInfo(book_id, book_type) {
    this.navCtrl.push(BookInfoPage, {
      book_id: book_id,
      book_type: book_type
    })
  }
  //Dom加载完成
  ionViewDidLoad() {
    this.pageHome_bg = document.querySelector('page-home');
    this.topHeight = jQuery('.book-top').height() + 6;
    this.header_blank = jQuery('.plan-nav-2');
    this.home_header = jQuery('#home_title');
    this.myScroll = new IScroll('#wrapper', {
      scrollbars: false,
      mouseWheel: false,
      interactiveScrollbars: true,
      shrinkScrollbars: 'scale',
      fadeScrollbars: true,
      scrollY: true,
      probeType: 3,
      bindToWrapper: true,
      click: true,
      deceleration: 0.0012,
      taps: true
    })

    //滚动中监控
    this.myScroll.on('scroll', () => {
      //是否在书架编辑过程中
      if (this.updateShelf) {
        return false;
      }
      if (this.myScroll.y < 0) {
        let n: number = (Number)(Math.abs((this.myScroll.y > 0 ? 0 : this.myScroll.y) / this.topHeight).toFixed(2));
        this.header_blank.css('opacity', n);
        this.home_header.css('background', `rgba(255,255,255,${n})`);
        if (cordova) {
          if (n > 0.5) {
            this.service.statusBar.styleDefault();
          }
          else {
            this.service.statusBar.styleBlackTranslucent();
          }
        }
        if (n > 0.5) {
          this.home_header.css('box-shadow', '0 0 1px #ccc');
        }
        else {
          this.home_header.css('box-shadow', 'none');
        }
      }
      else {
        this.header_blank.css('opacity', 0);
        this.home_header.css('box-shadow', 'none');
        this.home_header.css('background', `rgba(255,255,255,0)`);
        if (cordova)
          this.service.statusBar.styleBlackTranslucent();
      }
      //放大背景
      if (this.myScroll.y > 0) {
        this.pageHome_bg.style.backgroundSize = (100 + this.myScroll.y / 2.5) + '%';
      }
      else {
        this.pageHome_bg.style.backgroundSize = '100%';
      }
    })
    this.myScroll.on('scrollStart', () => {
      if (this.updateShelf) {
        return false;
      }
      this.myScroll_Y = this.myScroll.y;
    });
    this.myScroll.on('scrollEnd', () => {
      if (this.updateShelf || this.my_refresh) {
        return false;
      }
      if (this.myScroll_Y > this.myScroll.y) {
        if (this.myScroll.y + this.topHeight > 0) {
          this.my_refresh = true;
          setTimeout(() => {
            this.my_refresh = false;
          }, 500);
          this.myScroll.scrollTo(0, -this.topHeight, 200);
          this.hiddenTop = true;
        }
      }
      else if (this.myScroll.y != 0 && this.myScroll.y != this.topHeight) {
        if (this.myScroll.y + this.topHeight > 0) {
          this.my_refresh = true;
          setTimeout(() => {
            this.my_refresh = false;
          }, 500);
          this.myScroll.scrollTo(0, 0, 200);
        }
      }
    });
    //等待刷新
    setTimeout(() => {
      jQuery('.book_shlef_list').css({
        minHeight: jQuery('#scroller').parent().height() + 5
      });
      this.myScroll.refresh();
    }, 1000)
  }
  //修改热门推荐
  getHotBook() {
    //推荐
    let data = JSON.parse(localStorage.getItem('hotBook'));
    //判断是否需要更新
    if (this.service.getNetEork() == 'none') {
      this.hotBook = data.rows;
      return false;
    }
    this.service.post('/v3/api/recommendBooks/getList', { recommend_code: '10001', pageNum: 1, pageSize: 4 }).then(success => {
      if (success.code == 600) {
        this.navCtrl.push(LoginPage);
      }
      else if (success.code == 0) {
        this.hotBook = success.data.rows;
        //保留缓存
        let hdata = {
          time: this.toDayTime,
          rows: this.hotBook
        }
        localStorage.setItem('hotBook', JSON.stringify(hdata));
        //手动推送
        this.ref.detectChanges();
      }
      else {
        this.service.dialogs.alert(success.message, '提示', '确定');
      }
    }, error => {
      console.log(error)
      if (data && data.rows)
        this.hotBook = data.rows;
    })
  }
  //获取书架内容
  getShlefBook() {
    //关闭重复更新
    if (!this.unExecHttpService) {
      return false;
    }
    this.unExecHttpService = false;
    //默认回到顶部
    if (this.myScroll) {
      this.myScroll.scrollTo(0, 0, 200);
    }
    if (this.service.getNetEork() == 'none') {
      this.unExecHttpService = true;
      return false;
    }
    //重置运算基数
    this.updateCount = -1;
    this.service.post('/v3/api/bookShelf/getList').then(success => {
      if (success.code == 0) {
        if (!this.shlefBook)
          this.shlefBook = [];
        if (success.data.length == 0) {
          this.shlefBook = [];
          localStorage.setItem('shlefBook', '[]');
          jQuery('.add-find-book').show();
        }
        else {
          jQuery('.add-find-book').hide();
        }
        //循环处理每一条
        for (var i = 0; i < success.data.length; i++) {
          this.updateBookData(success.data[i]);
        }
        this.updateCount = 0;
        //手动调用变化
        this.ref.detectChanges();
        //更新书架内容状态
        this.downBookData();
      }
      else {
        this.service.dialogs.alert(success.message, '提示', '确定');
      }
      this.unExecHttpService = true;
    });
  }
  //下载图书本地资源
  downBookData() {
    for (var i = 0; i < this.shlefBook.length; i++) {
      let book = this.shlefBook[i];
      if (!book.native_cover || book.native_cover == '') {
        if (this.service.platformName == 'weixin' || this.service.platformName == 'ios') {
          book.native_cover = book.bk_cover.indexOf('http://') == -1 ? this.service.ctxPath + book.bk_cover : book.bk_cover;
          book.progrees = 100;
          book.unBook = true;
          this.updateCount += 1;
        }
        else {
          this.downBookCover(book);
        }
      }
      else {
        this.updateCount += 1;
      }
    }
  }
  //下载图书的封面
  downBookCover(book) {
    let cover = book.bk_cover.split('/');
    book.coverName = cover[cover.length - 1];
    this.service.ngFile.checkFile(this.service.savePath + 'files/cover/', book.coverName).then(success => {
      book.native_cover = this.service.savePath + '/files/cover/' + book.coverName;
      book.progrees = 100;
      book.unBook = true;
      this.updateCount += 1;
      //this.downBookEpub(book);
    }, error => {
      let url = book.book_type == 1 ? book.bk_cover : this.service.ctxPath + book.bk_cover;
      let targetPath = this.service.savePath + 'files/cover/' + book.coverName;
      this.service.fileTransfer.download(url, targetPath).then(success => {
        book.native_cover = this.service.savePath + '/files/cover/' + book.coverName;
        book.progrees = 100;
        book.unBook = true;
        this.updateCount += 1;
        //this.downBookEpub(book);
      }, error => {
        this.updateCount += 1;
        console.log('book cover down error');
      })
    })
  }
  //更新图书
  updateBookData(book) {
    let nb = true;
    for (var i = 0; i < this.shlefBook.length; i++) {
      if (this.shlefBook[i].bk_id == book.bk_id && this.shlefBook[i].book_type == book.book_type) {
        return nb = false;
      }
    }
    //结束之后再执行
    if (nb) {
      book.progrees = 0;
      book.unBook = false;
      this.shlefBook.unshift(book);
    }
  }
  //监控
  ngDoCheck() {
    //判断是否需要重置 书架
    if (this.service.unRefreshBookshelf) {
      this.service.unRefreshBookshelf = false;
      if (this.service.LoginUserInfo) {
        //是否获取书架推荐
        if (!this.hotBook)
          this.getHotBook();
        if (!this.shlefBook) {
          let data = JSON.parse(localStorage.getItem('shlefBook'));
          //先取缓存，再执行刷新
          if (data) {
            this.shlefBook = data;
          }
          this.getShlefBook();
        }
        else {
          this.getShlefBook();
        }
        this.isSingin();
      }
      else {
        //需要手动登录
        this.navCtrl.push(LoginPage);
      }
    }
    //判断是否需要重新存储图书
    if (this.shlefBook && this.updateCount >= this.shlefBook.length) {
      this.updateCount = -1;
      localStorage.setItem('shlefBook', JSON.stringify(this.shlefBook));
      console.log('存储');
      if (this.myScroll) {
        setTimeout(() => {
          this.myScroll.refresh();
        }, 500);
      }
      //////////////////////////////////////////////////////////////有网络才执行
      this.down_app();
    }
  }
  down_app() {
    this.service.post('/v3/appVersion/getAppVersion', {
      device_type: 'android',
      app_type: 2
    }).then(success => {
      console.log(success)
    });
    if (this.service.getNetEork() && this.service.getNetEork() != 'none') {
      this.service.post('/v3/appVersion/getAppVersion', {
        device_type: this.service.platformName,
        app_type: 2
      }).then(success => {
        if (success.code == 0) {
          if (parseInt(success.data.version_code) > this.service.version_code) {
            if (this.service.platformName == 'ios') {
              this.service.dialogs.confirm('你有一个新的版本需要更新!<' + success.data.version_name + '>', '提示', ['确定','稍候']).then(index => {
                if(index == 1){
                  console.log(success.data.package_url)
                  cordova.InAppBrowser.open(success.data.package_url, '_blank', 'location=no');
                }
              })
            }
            else {
              let load = this.service.loadingCtrl.create({
                spinner: 'hide',
                cssClass: 'app-down-loading',
                content: `<div class="jd-con">
                  <h1>发现新版本v${success.data.version_name}</h1>
                  <div class="jd-remark">${success.data.remark}</div>
                  <div class="jd">
                    <i></i>
                    <span>0%</span>
                  </div>
                 </div>`
              })
              load.present();
              let url = success.data.publish_url;
              let targetPath = this.service.savePath + '/files/android.apk';
              this.service.fileTransfer.download(url, targetPath, true).then(success => {
                load.dismiss();
                cordova.plugins.fileOpener2.open(targetPath, 'application/vnd.android.package-archive').then(sss => {
                  console.log('open app apk')
                }, eee => {
                  this.service.dialogs.alert(eee, '打开失败', '确定');
                })
              }, error => {
                this.service.dialogs.alert(error, '下载失败', '确定');
              });
              this.service.fileTransfer.onProgress(e => {
                let num = Math.floor(e.loaded / e.total * 100);
                if (num < 100) {
                  jQuery('.jd-con .jd i').width(num + '%');
                  jQuery('.jd-con .jd span').html(num + '%');
                }
              })
            }
          }
        }
      })
    }
  }
  isSingin() {
    //验证今天是否已经签到
    this.service.post('/v3/api/memberSign/signIn', {
      date: this.toDayTime,
      action: 'is_sign'
    }).then(res => {
      this.show_sing_in = res.code;
    })
  }
  //将要进入页面
  ionViewWillEnter() {
    if (jQuery.readerParam) {
        let options = {
          ctxPath: this.service.ctxPath.toString(),
          chid: jQuery.readerParam.chid + '',
          pagenum: jQuery.readerParam.pagenum + '',
          eventkey: jQuery.readerParam.eventkey + '',
          bookid: jQuery.readerParam.bookid + '',
          bookname: jQuery.readerParam.bookname + '',
          booktype: jQuery.readerParam.booktype + '',
          userid: this.service.LoginUserInfo.member_id.toString(),
          token: this.service.LoginUserInfo.token.toString()
        }
        jQuery.readerParam = null;
        navigator.BookRead.reader(options);
    }
    //声明阅读器回调方法
    jQuery.readePageBack = (name) => {
      if (name == 'login') {
        this.navCtrl.push(LoginPage);
      }
      else if (name == 'recharge') {
        this.navCtrl.push(RechargePage);
      }
      else if (cordova) {
        if (this.myScroll && this.myScroll.y < -this.topHeight) {
          this.service.statusBar.styleDefault();
        }
        else {
          this.service.statusBar.styleBlackTranslucent();
        }
      }
    }
    if (this.myScroll) {
      setTimeout(() => {
        this.myScroll.refresh();
      }, 500);
    }
    if (cordova) {
      if (this.myScroll && this.myScroll.y < -this.topHeight) {
        this.service.statusBar.styleDefault();
      }
      else {
        this.service.statusBar.styleBlackTranslucent();
      }
    }
    if (this.service.LoginUserInfo)
      this.isSingin();
  }
  //将要离开页面
  ionViewWillLeave() {
    if (cordova)
      this.service.statusBar.styleDefault();
  }
}
