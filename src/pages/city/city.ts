import { Component, ViewChild } from '@angular/core';
import { NavController, Slides } from 'ionic-angular';
import { AppService } from '../../app/app.service';
import { SearchPage } from '../search/search';
import { ClassifyPage } from '../classify/classify';
import { YcOrderPage } from '../ycorder/ycorder';
import { CbOrderPage } from '../cborder/cborder';
import { ClassifyListPage } from '../classifylist/classifylist';
import { XianmianPage } from '../xianmian/xianmian';
import { CbNewBookPage } from '../cbnewbook/cbnewbook';
import { CbHotBookPage } from '../cbhotbook/cbhotbook';
import { CbTjBookPage } from '../cbtjbook/cbtjbook';
import { TjBookPage } from '../tjbook/tjbook';
import { LoginPage } from '../login/login';
import { BookInfoPage } from '../bookinfo/bookinfo';
import { YcTypeBookPage } from '../yctypebook/yctypebook';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

declare let jQuery: any;
declare let Swiper: any;
@Component({
  selector: 'page-city',
  templateUrl: 'city.html'
})
export class CityPage {
  active_index: number = 1;
  mySwiper: any;

  m_20001: any; m_20002: any; m_20003: any; m_20004: any; m_20005: any; m_20006: any; m_20007: any; m_20008: any;
  m_30001: any; m_30002: any; m_30003: any; m_30004: any;
  m_40001: any; m_40002: any; m_40003: any; m_40004: any;
  m_50001: any; m_50002: any; m_50003: any; m_50004: any; m_50005: any; m_50006: any;
  g_10001: any; g_10002: any; g_10003: any; g_10004: any;

  c_nv: any;
  c_nan: any;
  wifi: boolean = true;
  @ViewChild(Slides) slides: Slides;
  constructor(public navCtrl: NavController, private barcodeScanner: BarcodeScanner, private service: AppService) {

  }
  ionViewDidLoad() {
    this.mySwiper = new Swiper('#mySwiper', {
      onTransitionEnd: (swiper) => {
        let currentIndex = swiper.activeIndex;
        this.active_index = currentIndex + 1;
        this.tabGetdata();
      }
    })
  }
  ionViewWillEnter() {
    this.service.statusBar.styleDefault();
    this.init();
  }
  //切换频道
  activeTo(n: number) {
    this.active_index = n;
    this.tabGetdata();
    this.mySwiper.slideTo(n - 1, 500, null);
  }
  //初始化
  init() {
    setTimeout(() => {
      if (this.service.getNetEork() == 'none') {
        jQuery('.page-notwork').show();
        jQuery('.has-wifi').hide();
      }
      else {
        jQuery('.page-notwork').hide();
        jQuery('.has-wifi').show();
      }
    }, 600);
    this.tabGetdata();
  }

  tabGetdata() {
    //20001,20002,20003,20004,20005,20006,20007,20008
    //30001,30002,30003,30004
    //40001,40002,40003,40004
    //50001,50002,50003,50004,50005,50006
    if (this.active_index == 2 && !this.g_10002) {
      this.get_m_all('30001,30002,30003,30004');
      this.get_g_10002();
      this.get_ClassList(0);
    }
    else if (this.active_index == 3 && !this.g_10003) {
      this.get_m_all('40001,40002,40003,40004');
      this.get_g_10003();
      this.get_ClassList(1);
    }
    else if (this.active_index == 4 && !this.g_10004) {
      this.get_m_all('50001,50002,50003,50004,50005,50006');
      this.get_g_10004();
    }
    else if (!this.g_10001) {
      this.get_m_all('20001,20002,20003,20004,20005,20006,20007,20008');
      this.get_g_10001();
    }
  }
  // 热推、星际、红书、最新
  toYcTypeBookPage(type: string, name: string, bookChannel: string) {
    this.navCtrl.push(YcTypeBookPage, {
      type: type,
      name: name,
      bookChannel: bookChannel
    });
  }
  //分类页
  toClassify(e?: any) {
    this.navCtrl.push(ClassifyPage);
  }
  //排行
  toOrder(e?: any) {
    this.navCtrl.push(YcOrderPage, {
      bookChannel: e
    });
  }
  //出版排行
  toOrder_cb() {
    this.navCtrl.push(CbOrderPage);
  }
  //出版新书
  toCbNewBookPage() {
    this.navCtrl.push(CbNewBookPage);
  }
  //出版热门
  toCbHotBookPage() {
    this.navCtrl.push(CbHotBookPage);
  }
  //分类列表
  toClassifyList(id: string, name: string, bookChannel: string) {
    this.navCtrl.push(ClassifyListPage, {
      id: id,
      name: name,
      bookChannel: bookChannel
    })
  }
  //限免
  toXianmian(type: string) {
    this.navCtrl.push(XianmianPage, {
      type: type
    })
  }
  //出版特价
  toBook_tj() {
    this.navCtrl.push(CbTjBookPage);
  }
  //推荐模块
  toTjBookPage(obj_id: string, obj_name: string) {
    this.navCtrl.push(TjBookPage, {
      obj_id: obj_id,
      obj_name: obj_name
    })
  }
  //获取分类
  get_ClassList(type) {
    this.service.post('/v3/api/bookCat/repoList', {
      pid: null,
      channel: type
    }).then(success => {
      if (type == 0) {
        this.c_nv = success.data;
      }
      if (type == 1) {
        this.c_nan = success.data;
      }
    })
  }
  //广告-精选
  get_g_10001() {
    this.service.post('/v3/adv/getAdv', {
      adv_code: '10001'
    }).then(success => {
      this.g_10001 = success.data;
    })
  }
  //女频-精选
  get_g_10002() {
    this.service.post('/v3/adv/getAdv', {
      adv_code: '10002'
    }).then(success => {
      this.g_10002 = success.data;
    })
  }
  //男频-精选
  get_g_10003() {
    this.service.post('/v3/adv/getAdv', {
      adv_code: '10003'
    }).then(success => {
      this.g_10003 = success.data;
    })
  }
  //出版-精选
  get_g_10004() {
    this.service.post('/v3/adv/getAdv', {
      adv_code: '10004'
    }).then(success => {
      this.g_10004 = success.data;
    })
  }
  get_m_all(codes: any) {
    //20001,20002,20003,20004,20005,20006,20007,20008
    //30001,30002,30003,30004
    //40001,40002,40003,40004
    //50001,50002,50003,50004,50005,50006
    this.service.post('/v3/api/recommendBooks/getListByCodes', {
      recommend_codes: codes
    }).then(success => {
      success.data.forEach(element => {
        if (element.code == '20001') {
          this.m_20001 = element.data;
        }
        else if (element.code == '20002') {
          this.m_20002 = element.data;
        }
        else if (element.code == '20003') {
          this.m_20003 = element.data;
        }
        else if (element.code == '20004') {
          this.m_20004 = element.data;
        }
        else if (element.code == '20005') {
          this.m_20005 = element.data;
        }
        else if (element.code == '20006') {
          this.m_20006 = element.data;
        }
        else if (element.code == '20007') {
          this.m_20007 = element.data;
        }
        else if (element.code == '20008') {
          this.m_20008 = element.data;
        }
        else if (element.code == '30001') {
          this.m_30001 = element.data;
        }
        else if (element.code == '30002') {
          this.m_30002 = element.data;
        }
        else if (element.code == '30003') {
          this.m_30003 = element.data;
        }
        else if (element.code == '30004') {
          this.m_30004 = element.data;
        }
        else if (element.code == '40001') {
          this.m_40001 = element.data;
        }
        else if (element.code == '40002') {
          this.m_40002 = element.data;
        }
        else if (element.code == '40003') {
          this.m_40003 = element.data;
        }
        else if (element.code == '40004') {
          this.m_40004 = element.data;
        }
        else if (element.code == '50001') {
          this.m_50001 = element.data;
        }
        else if (element.code == '50002') {
          this.m_50002 = element.data;
        }
        else if (element.code == '50003') {
          this.m_50003 = element.data;
        }
        else if (element.code == '50004') {
          this.m_50004 = element.data;
        }
        else if (element.code == '50005') {
          this.m_50005 = element.data;
        }
        else if (element.code == '50006') {
          this.m_50006 = element.data;
        }
      });
      setTimeout(() => {
        jQuery('#mySwiper').animate({
          opacity: 1
        }, 'slow', () => {
          this.service.loadingEnd();
        });
      }, 500)
    })
  }
  //图书详情
  toBookInfo(book_id, book_type) {
    if (book_id && book_type) {
      this.navCtrl.push(BookInfoPage, {
        book_id: book_id,
        book_type: book_type
      })
    }
  }
  //前往搜索
  toSearch() {
    this.navCtrl.push(SearchPage);
  }

  //扫码加书
  saomaAddBook() {
    if (this.service.getNetEork() == 'none') {
      this.service.dialogs.alert('网络异常，请检查你的网络状态正常后再试!', '提示', '确定');
      return false;
    }
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
                this.navCtrl.push(LoginPage);
              }
              else if (success.code == 0) {
                //重新获取书架内容
                this.service.unRefreshBookshelf = true;
                this.navCtrl.parent.select(0);
              }
              else {
                this.service.dialogs.alert(success.message, '提示', '确定');
              }
            })
          }
          else {
            this.service.dialogs.alert('你扫描的二维码有误，请确认后再试!');
          }
        }
      }, (error) => {
        this.service.dialogs.alert(error, '提示', '确定');
      })
    })
  }
}
