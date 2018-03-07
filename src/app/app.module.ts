import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

//页面
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { CityPage } from '../pages/city/city';
import { FindPage } from '../pages/find/find';
import { CenterPage } from '../pages/center/center';
import { QiandaoPage } from '../pages/qiandao/qiandao';
import { SearchPage } from '../pages/search/search';
import { LoginPage } from '../pages/login/login';
import { RegisterPage } from '../pages/register/register';
import { ResetpwdPage } from '../pages/resetpwd/resetpwd';
import { QiandaoRemarkPage } from '../pages/qiandaoremark/qiandaoremark';
import { ClassifyPage } from '../pages/classify/classify';
import { RechargePage } from '../pages/recharge/recharge';
import { YcOrderPage } from '../pages/ycorder/ycorder';
import { CbOrderPage } from '../pages/cborder/cborder';
import { ClassifyListPage } from '../pages/classifylist/classifylist';
import { XianmianPage } from '../pages/xianmian/xianmian';
import { CbNewBookPage } from '../pages/cbnewbook/cbnewbook';
import { CbHotBookPage } from '../pages/cbhotbook/cbhotbook';
import { CbTjBookPage } from '../pages/cbtjbook/cbtjbook';
import { TjBookPage } from '../pages/tjbook/tjbook';
import { BookInfoPage } from '../pages/bookinfo/bookinfo';
import { CaogenPage } from '../pages/caogen/caogen';
import { CaogenInfoPage } from '../pages/caogeninfo/caogeninfo';
import { YcTypeBookPage } from '../pages/yctypebook/yctypebook';
import { MuluPage } from '../pages/mulu/mulu';
import { SetingPage } from '../pages/seting/seting';
import { NickNamePage } from '../pages/nickname/nickname';
import { QianmingPage } from '../pages/qianming/qianming';
import { PhonePage } from '../pages/phone/phone';
import { EmailPage } from '../pages/email/email';
import { ReadJiluPage } from '../pages/readjilu/readjilu';
import { ReviewsPage } from '../pages/reviews/reviews';
import { SendReviewPage } from '../pages/sendreview/sendreview';
import { BookReviewsPage } from '../pages/bookreviews/bookreviews';

//插件
import { SplashScreen } from '@ionic-native/splash-screen';
import { Device } from '@ionic-native/device';
import { StatusBar } from '@ionic-native/status-bar';
import { Dialogs } from '@ionic-native/dialogs';
import { File } from '@ionic-native/file';
import { FileTransfer } from '@ionic-native/file-transfer';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { ImagePicker } from '@ionic-native/image-picker';
import { Camera } from '@ionic-native/camera';

//公共服务
import { Http, HttpModule, XHRBackend, RequestOptions } from '@angular/http';
import { AppService } from './app.service';
import { HttpService } from './http.service';

export function interceptorFactory(xhrBackend: XHRBackend, requestOptions: RequestOptions) {
  let service = new HttpService(xhrBackend, requestOptions);
  return service;
}

@NgModule({
  declarations: [
    MyApp, HomePage, TabsPage,
    CenterPage, CityPage, FindPage,
    QiandaoPage, SearchPage, LoginPage, RegisterPage, ResetpwdPage,
    RechargePage, BookInfoPage, MuluPage, BookReviewsPage, SendReviewPage,
    ReadJiluPage, ReviewsPage, SetingPage, ClassifyPage, ClassifyListPage,
    NickNamePage, QianmingPage, PhonePage, EmailPage, QiandaoRemarkPage, XianmianPage,
    CaogenPage, CaogenInfoPage, YcOrderPage, YcTypeBookPage, CbOrderPage, CbTjBookPage,
    CbNewBookPage, CbHotBookPage, TjBookPage
  ],
  imports: [
    HttpModule,
    BrowserModule,
    IonicModule.forRoot(MyApp, {
      pageTransition: 'md-transition',
      backButtonText: '',
      backButtonIcon: 'iconfont-icon-rt',//按钮图标样式
      tabsHideOnSubPages: 'true' //隐藏全部子页面tabs
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp, HomePage, TabsPage,
    CenterPage, CityPage, FindPage,
    QiandaoPage, SearchPage, LoginPage, RegisterPage, ResetpwdPage,
    RechargePage, BookInfoPage, MuluPage, BookReviewsPage, SendReviewPage,
    ReadJiluPage, ReviewsPage, SetingPage, ClassifyPage, ClassifyListPage,
    NickNamePage, QianmingPage, PhonePage, EmailPage, QiandaoRemarkPage, XianmianPage,
    CaogenPage, CaogenInfoPage, YcOrderPage, YcTypeBookPage, CbOrderPage, CbTjBookPage,
    CbNewBookPage, CbHotBookPage, TjBookPage
  ],
  providers: [
    HttpService,
    {
      provide: Http,
      useFactory: interceptorFactory,
      deps: [XHRBackend, RequestOptions]
    },
    StatusBar, SplashScreen,
    AppService,
    Device, Dialogs, File, FileTransfer,
    ImagePicker, BarcodeScanner, Camera,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
