import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Platform, ActionSheetController, Navbar, Tabs } from 'ionic-angular';
import { AppService } from '../../app/app.service';
import { LoginPage } from '../login/login';

declare let navigator: any;
declare let jQuery: any;
declare let inAppPurchase: any;
@Component({
  selector: 'page-recharge',
  templateUrl: 'recharge.html'
})
export class RechargePage {
  payNum: number = 0;
  @ViewChild(Navbar) navBar: Navbar;
  constructor(public navCtrl: NavController, public params: NavParams,
    public platform: Platform, private service: AppService, public actionsheetCtrl: ActionSheetController, private tab: Tabs) {

  }
  //返回事件重置
  ionViewDidLoad() {
    this.navBar.backButtonClick = this.backButtonClick;
  }
  backButtonClick = (e: UIEvent) => {
    if (jQuery.readerParam) {
      this.tab.select(0);
      this.navCtrl.popToRoot();
    }
    else {
      this.navCtrl.pop();
    }
  }
  ionViewWillEnter() {
    this.service.statusBar.styleDefault();
    //再次验证token 是否有效
    this.service.post('/v2/api/mobile/memberInfo').then(success => {
      if (success.code == 600) {
        this.service.dialogs.alert('登录信息失效, 需要你重新登录', '系统验证', '确定').then(res => {
          this.navCtrl.push(LoginPage);
        })
      }
    })
  }
  setPageNun(n: number) {
    this.payNum = n;
    //android
    if (!this.platform.is('ios')) {
      let actionSheet = this.actionsheetCtrl.create({
        title: '请选择支付方式',
        cssClass: 'action-sheets-basic-page',
        buttons: [
          {
            text: '支付宝支付',
            role: 'destructive',
            icon: 'alipay',
            handler: () => {
              this.alipayTo();
            }
          },
          {
            text: '微信支付',
            icon: 'weixinpay',
            handler: () => {
              this.weixinpayTo();
            }
          }
        ]
      });
      actionSheet.present();
    }
    else {
      //ios 内购
      this.iospay();
    }
  }
  iospay() {
    let payid = 'cjzww6.0';
    let parNum = 600;
    if (this.payNum == 30) {
      payid = 'cjzww30.0'
      parNum = 3300;
    }
    if (this.payNum == 50) {
      payid = 'cjzww50.0'
      parNum = 6250;
    }
    if (this.payNum == 98) {
      payid = 'cjzww98.0'
      parNum = 14800;
    }
    if (this.payNum == 198) {
      payid = 'cjzww198.0'
      parNum = 34800;
    }
    if (this.payNum == 298) {
      payid = 'cjzww298.0'
      parNum = 59800;
    }
    this.service.loadingStart();
    inAppPurchase.getProducts([payid])
      .then((products) => {
        inAppPurchase.buy(payid)
          .then((data) => {
            //添加充值记录
            this.service.post('/v3/app/payRecord', {
              pay_type: 'ios',
              amount: this.payNum
            });
            let d_num: any = localStorage.getItem('choujiang_num');
            if (!d_num || d_num == '' || isNaN(d_num)) {
              d_num = 0;
            }
            else {
              d_num = parseInt(d_num) + 1;
            }
            localStorage.setItem('choujiang_num', d_num.toString());
            //添加长江币
            this.service.post('/v3/payAmount/addCut', {
              amount: parNum,
              action: 'add'
            }).then(addSuccess => {
              this.service.loadingEnd();
              this.service.getUserInfo();
              this.service.dialogs.alert('恭喜你成功充值' + parNum + '个长江币', '提示', '确定');
            })
          })
          .catch((err) => {
            this.service.loadingEnd();
            this.service.dialogs.alert(err.errorMessage, '错误', '确定');
          });
      })
      .catch((err) => {
        this.service.loadingEnd();
        this.service.dialogs.alert(err.errorMessage, '错误', '确定');
      });

  }
  weixinpayTo() {
    this.service.post('/v3/app/payOrder', {
      pay_type: 'weixin',
      amount: this.payNum
    }).then(success => {
      let data = success.data;
      var weixin = navigator.weixin;
      weixin.sendPayReq({
        "appid": "wx1726323de580e8ba",
        "urlString": "http://91tkp.com:3001/wxSign",
        "method": "post",
        "data": {
          "return_code": data.return_code,
          "return_msg": data.return_msg,
          "appid": data.appid,
          "mch_id": data.mch_id,
          "nonce_str": data.nonce_str,
          "sign": data.sign,
          "result_code": data.result_code,
          "prepay_id": data.prepay_id,
          "trade_type": data.trade_type,
          "timestamp": data.timestamp,
          "siteSign": data.siteSign
        }
      }, (retcode) => {
        if (retcode == 0) {
          //添加充值记录
          this.service.post('/v3/app/payRecord', {
            pay_type: 'weixin',
            amount: this.payNum
          })
          let d_num: any = localStorage.getItem('choujiang_num');
          if (!d_num || d_num == '' || isNaN(d_num)) {
            d_num = 0;
          }
          else {
            d_num = parseInt(d_num) + 1;
          }
          localStorage.setItem('choujiang_num', d_num.toString())
          this.service.dialogs.alert("充值成功!", '充值提示', '确定');
        }
      }, (message) => {
        this.service.dialogs.alert("充值失败:" + message, '充值提示', '确定');
      });

    });
  }
  alipayTo() {
    this.service.post('/v3/app/payOrder', {
      pay_type: 'alipay',
      amount: this.payNum
    }).then(success => {
      let data = success.data;
      var rsa = "MIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBALTdMPtfphiRr0DdrjAXwSEseQm9E52WG/33kwzx2LVFKXSVBb3KhO7wEeBiKvkYvvHPaCJ2uicmn0SfOX412Fu3/3WDOP2Yj3UW66LMSDhrJ6vV3dafHy7cfj0lqNb6rEgND47NjYyjxLHzsMDNBxa8tMQzFE+vukizy3iXcl9nAgMBAAECgYApwePcNbIofAJFbKkZy3I4kYcEe5X6zTx7P1zBIVlSSLyQgROJRSe57s2By8h2KIN1WtiFFHpYLa+Z7VUd0Zq49t1h5/yBjiTuHlDW7xZFInIdaNhTIeuShXCV1sgn8Ea5/gM3fLu3MTfBXd3YeoNVukkYp5om8yg0uzFuVCNp8QJBAOKIbhy9mWuR4hEO1Ha8JLbNoYHbpgXvr/psIVfY43S6Z/bfAckVyEWfzkGqsfosBHINIwZa/Sz3IQXW3dwDpZkCQQDMY/tqXcp9hC08DfOBmb5jIwFt8yHkRtHAbyQWh6UDHdfRV9P+PP31+ass/JgqUA/G8a9F9AnbE4434CyqP0z/AkEAjrp/BkS/gXMtCKpbW2Q3jaYJ+JO4C011h0bRy1OwHD/GeVkQ+u1qfdOuVNmDwagyNNnqE3sIwWgDunYi2xjBIQJBAJuZMflT1aegTF9/r3Vmec43BAuUIKUMVPpOogaU1UZ+HaK9XiIahKwRmgLxeVYdBSXLMEfs9OPXC1n2S4qADjkCQQDT27nfEXDiAKZXYzBUVqw4WiScuyEHZH9QA7mMYNBJUGGuRou4FIV7RWejnWSd5VTP0udOdBGGviYWdUyFKgjQ";
      var pubRsa = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDDI6d306Q8fIfCOaTXyiUeJHkrIvYISRcc73s3vF1ZT7XN8RNPwJxo8pWaJMmvyTn9N4HQ632qJBVHf8sxHi/fEsraprwCtzvzQETrNRwVxLO5jVmRGi60j8Ue1efIlzPXV9je9mkjzOmdssymZkh2QhUrCmZYI/FCEa3/cNMW0QIDAQAB";
      data.rsa_private = rsa;
      data.rsa_public = pubRsa;
      navigator.alipay.pay({
        "partner": data.partner,
        "rsa_private": rsa,
        "rsa_public": pubRsa,
        "seller": data.seller_id,
        "subject": data.subject,
        "body": data.body,
        "price": data.total_fee,
        "tradeNo": data.out_trade_no,
        "timeout": data.it_b_pay,
        "notifyUrl": 'http://www.cjzww.com/interface/MobInterface/alipay/notify_url.php'//data.notify_url
      }, (success) => {
        let choujiang_num = 0;
        let d_num: any = localStorage.getItem('choujiang_num');
        if (!d_num || d_num == '' || isNaN(d_num)) {
          d_num = 0;
        }
        else {
          d_num = parseInt(d_num);
        }
        if (success == 9000) {
          choujiang_num = 1;
          this.service.dialogs.alert("充值成功!", '充值提示', '确定');
        }
        else if (success == 8000) {
          choujiang_num = 1;
          this.service.dialogs.alert("订单已发送，正在处理中!", '充值提示', '确定');
        }
        else if (success == 4000) {
          this.service.dialogs.alert("订单支付失败,请稍后再试!", '充值提示', '确定');
        }
        else if (success == 6001) {
          console.log("用户中途取消:" + success)
        }
        else if (success == 6002) {
          this.service.dialogs.alert("网络连接出错,请稍后再试!", '充值提示', '确定');
        }
        else {
          choujiang_num = 1;
          this.service.dialogs.alert("充值成功!", '充值提示', '确定');
        }
        if (choujiang_num > 0) {
          //添加充值记录
          this.service.post('/v3/app/payRecord', {
            pay_type: 'alipay',
            amount: this.payNum
          })
          choujiang_num = d_num + 1;
          localStorage.setItem('choujiang_num', choujiang_num.toString());
        }
      }, (error) => {
        this.service.dialogs.alert('支付失败~[' + error + ']', '失败', '确定');
      });

    })
  }

}
