import { Component, ViewChild } from '@angular/core';
import { NavController, Slides } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { AppService } from '../../app/app.service';
import { ClassifyPage } from '../classify/classify';
import { BookInfoPage } from '../bookinfo/bookinfo';
import { LoginPage } from '../login/login';
declare let jQuery: any;
@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {
  unbarcodeScanner: boolean = true; //限制扫码
  hotKeys: any = [];
  mySearchText: any;
  searchKeys: any = [];
  showSearchForm: boolean = true;
  pet: string = 'yuanchuang';
  segmentsArray: any = ['yuanchuang', 'chuban'];
  myScroll: any;
  myScroll_1: any;
  ajaxBool_yuanchuang: boolean = true;
  ajaxBool_chuban: boolean = true;

  nowifi_key: any;
  @ViewChild(Slides) slides: Slides;
  constructor(public navCtrl: NavController, private barcodeScanner: BarcodeScanner, private service: AppService) {

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
  //图书分类
  openModal() {
    this.navCtrl.push(ClassifyPage);
  }
  ionViewDidLoad() {
    this.myScroll = jQuery('#scroller1').on('scroll', () => {
      let div = document.getElementById('scroller1');
      if (div.scrollHeight - div.scrollTop - div.clientHeight < 100) {
        if (this.ajaxBool_yuanchuang && this.param_yuanchuan.pages > this.param_yuanchuan.pageNum) {
          this.get_yuanchuan();
        }
      }
    });

    this.myScroll_1 = jQuery('#scroller2').on('scroll', () => {
      let div = document.getElementById('scroller2');
      if (div.scrollHeight - div.scrollTop - div.clientHeight < 100) {
        if (this.ajaxBool_chuban && this.param_chuban.pages > this.param_chuban.pageNum) {
          this.get_chuban();
        }
      }
    });
  }
  segmentChanged() {
    let i = this.segmentsArray.indexOf(this.pet);
    this.slides.slideTo(i, 500);
  }
  slideChanged() {
    let currentIndex = this.slides.getActiveIndex();
    if (currentIndex < 2) {
      this.pet = this.segmentsArray[currentIndex];
    }
  }
  ionViewDidEnter() {
    if (this.service.platformName == 'ios') {
      jQuery('page-search ion-navbar').eq(0).css('opacity', 1);
      let keyCon: any = jQuery('#fixKeysCon').css('top', jQuery('page-search ion-navbar').eq(1).offset().top);
      keyCon.fadeIn('fast', function () {
        jQuery('page-search ion-navbar').eq(1).css('opacity', 1);
      });
    }
    else {
      jQuery('#fixKeysCon').css('top', jQuery('page-search ion-navbar').eq(1).offset().top);

    }
    setTimeout(() => {
      jQuery('#mySearchInput').focus();
    }, 300)

    if (!this.service.platformName)
      return false;
    //获取最新的热门关键词
    this.service.post('/v3/api/searchKey/getSearchkeyList', {
      display: 10,
      org_id: this.service.LoginUserInfo.org_id
    }).then((success) => {
      this.hotKeys = success.data;
    });
    let data = JSON.parse(localStorage.getItem('searchKeys'));
    if (data) {
      this.searchKeys = data;
    }
    else {
      this.searchKeys = [];
    }
  }
  ionViewWillLeave() {
    if (this.service.platformName == 'ios') {
      jQuery('#fixKeysCon').hide();
      jQuery('page-search ion-navbar').css('opacity', 0);
    }
  }
  search() {
    //原创搜索
    this.get_yuanchuan(this.mySearchText);
    this.get_chuban(this.mySearchText);

    jQuery('#fixKeysCon').hide();
    jQuery('#mySearchInput').blur();
    let arr = [{
      name: this.mySearchText
    }];
    //替换目前的搜索内容
    for (let i in this.searchKeys) {
      if (this.searchKeys[i].name != this.mySearchText && arr.length < 10) {
        arr.push(this.searchKeys[i]);
      }
    }
    this.searchKeys = arr;
    localStorage.setItem('searchKeys', JSON.stringify(arr));
  }
  delSearchKeys() {
    this.searchKeys = [];
    localStorage.setItem('searchKeys', '[]');
  }
  //扫码加书
  saomaAddBook() {
    if (!this.unbarcodeScanner)
      return false;
    this.unbarcodeScanner = false;
    this.service.dialogs.alert('您正在使用扫码加书功能，请将摄像头对准图书二维码', '温馨提示', '确定').then(() => {
      this.barcodeScanner.scan().then((success) => {
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
                this.service.loadingEnd();
                this.navCtrl.push(LoginPage);
              }
              else if (success.code != 0) {
                this.service.loadingEnd();
                this.service.dialogs.alert(success.message, '提示', '确定');
              }
              else {
                //重新获取书架内容
                this.service.unRefreshBookshelf = true;
                this.navCtrl.pop();
              }
              this.unbarcodeScanner = true;
            })
          }
          else {
            this.service.dialogs.alert('你扫描的二维码有误，请确认后再试!');
            this.unbarcodeScanner = true;
          }
        }
      }, (error) => {
        this.service.dialogs.alert(error, '提示', '确定');
        this.unbarcodeScanner = true;
      })
    })
  }
  //搜索
  toSearchPage(key) {
    if (this.service.getNetEork()  == 'none') {
      jQuery('.page-notwork').show();
      jQuery('.has-wifi').hide();
      this.nowifi_key = key;
    }
    else {
      jQuery('.page-notwork').hide();
      jQuery('.has-wifi').show();

      //原创搜索
      this.get_yuanchuan(key);
      this.get_chuban(key);
      this.mySearchText = key;
    }
    jQuery('#fixKeysCon').hide();
  }
  searchFocus() {
    jQuery('#fixKeysCon').show();
  }
  param_yuanchuan: any = {
    book_type: 1,
    searchText: null,
    pageNum: 0,
    pageSize: 20,
    pages: 1,
    total: 0
  }
  yuanchuan_book: any = [];
  //获取原创
  get_yuanchuan(txt?: string) {
    if (!this.ajaxBool_yuanchuang)
      return false;
    if (txt) {
      this.param_yuanchuan.searchText = txt;
      this.param_yuanchuan.pageNum = 0;
      this.param_yuanchuan.pages = 1;
      this.yuanchuan_book = [];
      jQuery('#unmore1,#unmore11').hide();
    }
    this.param_yuanchuan.pageNum += 1;

    if (this.param_yuanchuan.pageNum > this.param_yuanchuan.pages) {
      if (!this.yuanchuan_book || this.yuanchuan_book.length == 0) {
        jQuery('#unmore11').show();
      }
      else {
        jQuery('#unmore1').show();
      }
      jQuery('#loading1').hide();
      return false;
    }
    else {
      this.ajaxBool_yuanchuang = false;
      jQuery('#loading1').show();
    }
    this.service.post('/v3/api/search/bookList', this.param_yuanchuan).then(success => {
      this.param_yuanchuan.pages = success.data.pages;
      this.param_yuanchuan.total = success.data.total;
      for (let i in success.data.rows) {
        this.yuanchuan_book.push(success.data.rows[i]);
      }
      jQuery('#loading1').hide();
      if (!this.yuanchuan_book || this.yuanchuan_book.length == 0) {
        jQuery('#unmore11').show();
      }
      else if (this.param_yuanchuan.pages == this.param_yuanchuan.pageNum) {
        jQuery('#unmore1').show();
      }
      this.ajaxBool_yuanchuang = true;
    })
  }
  param_chuban: any = {
    book_type: 2,
    searchText: null,
    pageNum: 0,
    pageSize: 20,
    pages: 1,
    total: 0
  }
  chuban_book: any = [];
  //获取出版
  get_chuban(txt?: string) {
    if (!this.ajaxBool_chuban)
      return false;
    if (txt) {
      this.param_chuban.searchText = txt;
      this.param_chuban.pageNum = 0;
      this.param_chuban.pages = 1;
      this.chuban_book = [];
      jQuery('#unmore2,#unmore22').hide();
    }
    this.param_chuban.pageNum += 1;
    if (this.param_chuban.pageNum > this.param_chuban.pages) {
      if (!this.chuban_book || this.chuban_book.length == 0) {
        jQuery('#unmore22').show();
      }
      else {
        jQuery('#unmore2').show();
      }
      jQuery('#loading2').hide();
      return false;
    }
    else {
      this.ajaxBool_chuban = false;
      jQuery('#loading2').show();
    }
    this.service.post('/v3/api/search/bookList', this.param_chuban).then(success => {
      this.param_chuban.pages = success.data.pages;
      this.param_chuban.total = success.data.total;
      for (let i in success.data.rows) {
        this.chuban_book.push(success.data.rows[i]);
      }
      jQuery('#loading2').hide();
      if (!this.chuban_book || this.chuban_book.length == 0) {
        jQuery('#unmore22').show();
      }
      else if (this.param_chuban.pages == this.param_chuban.pageNum) {
        jQuery('#unmore2').show();
      }
      this.ajaxBool_chuban = true;
    })
  }
}
