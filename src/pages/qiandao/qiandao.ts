import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AppService } from '../../app/app.service';
import { QiandaoRemarkPage } from '../qiandaoremark/qiandaoremark';
import { RechargePage } from '../recharge/recharge';
import { LoginPage } from '../login/login';

declare let jQuery: any;
@Component({
  selector: 'page-qiandao',
  templateUrl: 'qiandao.html'
})
export class QiandaoPage {
  allDayNum: number = 0; //本月所有天数
  nowDay: string = '01'; //今天
  nowDate: any = new Date();
  allDayArray: any = []; //所有签到记录

  coujiangArr: any = null; //抽奖记录
  nowChoujiangDay: any = null; //当前抽奖天

  qiandaoToday: any; //今日是否签到
  choujiangNum: number = 0//抽奖次数
  constructor(public navCtrl: NavController, public params: NavParams, private service: AppService) {
    this.allDayNum = new Date(this.nowDate.getFullYear(), (this.nowDate.getMonth() + 1), 0).getDate();
    let nn = this.nowDate.getDate();
    this.nowDay = nn >= 10 ? nn : '0' + nn;

    let year = this.nowDate.getFullYear();
    let month = this.nowDate.getMonth() + 1;
    month = month >= 10 ? month : '0' + month;
    for (let i = 1; i <= this.allDayNum; i++) {
      let day = i >= 10 ? i : '0' + i;
      this.allDayArray.push({
        sign_time: year + '-' + month + '-' + day,
        day: day
      });
      if (day == this.nowDay) {
        this.qiandaoToday = {
          sign_time: year + '-' + month + '-' + day,
          day: day
        }
      }
    }
    this.service.loadingStart();
    this.get_qiandaoData();
  }
  //签到规则
  toremark() {
    this.navCtrl.push(QiandaoRemarkPage);
  }
  ionViewWillEnter() {
    this.service.statusBar.styleBlackTranslucent();
  }
  //获取签到记录
  get_qiandaoData() {
    this.service.post('/v3/api/memberSign/monthSign', {}).then(success => {
      if (success.code == 600) {
        this.service.loadingEnd();
        this.navCtrl.push(LoginPage);
      }
      else if (success.code != 0) {
        this.service.loadingEnd();
        this.service.dialogs.alert(success.message, '提示', '确定');
      }
      else {
        for (let i = 0; i < success.data.length; i++) {
          let index = this.forEachDay(success.data[i].sign_time);
          this.allDayArray[index]['id'] = success.data[i]['id'];
          this.allDayArray[index]['member_id'] = success.data[i]['member_id'];
          this.allDayArray[index]['sign_gift'] = success.data[i]['sign_gift'];
          this.allDayArray[index]['sign_time'] = success.data[i]['sign_time'];
          if (this.nowDay == success.data[i].sign_time.split('-')[2]) {
            this.qiandaoToday = this.allDayArray[index];
          }
          //判断是否已经签到，但是没有抽奖
          if (!success.data[i]['sign_gift']) {
            this.choujiangNum += 1;
          }
        }
      }
      this.service.loadingEnd();
    })
  }
  //找到对应天
  forEachDay(time) {
    let index = null;
    for (let i = 0; i < this.allDayArray.length; i++) {
      if (this.allDayArray[i].sign_time == time) {
        index = i;
      }
    }
    return index;
  }
  //今天签到
  qiandaotoday(day: any, isbuqian?: any) {
    day = !day ? this.qiandaoToday : day;
    if (!day.id && day.day <= this.nowDay) {
      this.service.loadingStart();
      this.service.post('/v3/api/memberSign/signIn', {
        date: day.sign_time,
        action: 'sign',
        type: isbuqian
      }).then((success) => {
        if (success.code == 600) {
          this.service.loadingEnd();
          this.navCtrl.push(LoginPage);
        }
        else if (success.code != 0) {
          this.service.loadingEnd();
          this.service.dialogs.alert(success.message, '提示', '确定');
        }
        else {
          this.get_qiandaoData();
          this.choujiang(day);
        }
      })
    }
  }
  //补签
  buqian(day) {
    //判断是否有补签机会
    let b_num = 0;
    let b = localStorage.getItem('choujiang_num');
    if (b) {
      b_num = parseInt(b);
    }
    if (b_num > 0) {
      this.service.dialogs.confirm('你还剩余' + b_num + '次补签机会', '补签', ['确认补签', '取消']).then(index => {
        if (index == 1) {
          b_num -= 1;
          localStorage.setItem('choujiang_num', b_num.toString());
          this.qiandaotoday(day, 'buqian');
        }
      })
    }
    else {
      this.service.dialogs.confirm('充值任意金额可以获得一次补签机会，每日不限补签次数', '补签', ['前往充值', '取消']).then(index => {
        if (index == 1) {
          this.navCtrl.push(RechargePage);
        }
      })
    }
  }
  //直接抽奖
  choujiang(day) {
    this.nowChoujiangDay = day;
    this.showChoujiang();
  }
  showChoujiang() {
    let ayy = [];
    //创建50个 5分
    for (let i = 1; i <= 50; i++) {
      ayy.push(5);
    }
    //创建20个 10分
    for (let i = 1; i <= 20; i++) {
      ayy.push(10);
    }
    //创建10个 20分
    for (let i = 1; i <= 15; i++) {
      ayy.push(20);
    }
    //创建10个 50分
    for (let i = 1; i <= 10; i++) {
      ayy.push(10);
    }
    //创建4个 100分
    for (let i = 1; i <= 4; i++) {
      ayy.push(100);
    }
    //创建1个 200分
    ayy.push(200);
    //循环6次抽奖结果
    this.coujiangArr = [];
    for (let i = 1; i <= 6; i++) {
      let mm = parseInt((parseFloat(Math.random().toString()) * 100).toString())
      this.coujiangArr.push({
        select: false,
        first: false,
        n: ayy[mm]
      });
    }
    //显示
    jQuery('#choujiang').show();
    jQuery('.qd-content').addClass('qd-hidden');
  }
  //关闭
  choujiangClose() {
    jQuery('.qd-content').removeClass('qd-hidden');
    jQuery('#choujiang').hide();
  }
  //翻牌
  fanpai(citem) {
    citem.select = true;
    if (!this.nowChoujiangDay.sign_gift) {
      this.nowChoujiangDay.sign_gift = citem.n + '长江币';
      citem.first = true;
      this.service.post('/v3/api/memberSign/signGift', {
        date: this.nowChoujiangDay.sign_time,
        sign_gift: this.nowChoujiangDay.sign_gift
      }).then(success => {
        this.get_qiandaoData();
        this.service.post('/v3/payAmount/addCut', {
          amount: citem.n,
          action: 'add'
        }).then(addSuccess => {
          if (success.code == 600) {
            this.service.loadingEnd();
            this.navCtrl.push(LoginPage);
          }
          else if (success.code != 0) {
            this.service.loadingEnd();
            this.service.dialogs.alert(success.message, '提示', '确定');
          }
          else {
            //重新获取用户信息
            this.service.getUserInfo();
            this.service.dialogs.alert('恭喜你获得' + this.nowChoujiangDay.sign_gift, '提示', '确定').then(scc => {
              this.coujiangArr.forEach(element => {
                element.select = true;
              });
            });
          }
        })
      });
    }
  }
}
