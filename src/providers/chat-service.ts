import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { map } from 'rxjs/operators/map';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";

export class ChatMessage {
  messageId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  toUserId: string;
  time: number | string;
  message: any;
  status: string;
  sensor?:any;
}

export class UserInfo {
  id: string;
  name?: string;
  avatar?: string;
}

@Injectable()
export class ChatService {

  constructor(private http: HttpClient,
              private events: Events) {
  }

  mockNewMsg({ message, sensor }) {

    const refineMsg = typeof message === "object" ? ( message.length ? message[0].text : "Whatever ask another question" ) : message;

    const mockMsg: ChatMessage = {
      messageId: Date.now().toString(),
      userId: '210000198410281948',
      userName: 'Qplex',
      userAvatar: './assets/qplex.png',
      toUserId: '140000198202211138',
      time: Date.now(),
      message: refineMsg,
      status: 'success',
      sensor: sensor
    };

    setTimeout(() => {
      this.events.publish('chat:received', mockMsg, Date.now())
    }, Math.random() * 1800)
  }

  getMsgList(): Observable<ChatMessage[]> {
    const msgListUrl = './assets/mock/msg-list.json';
    return this.http.get<any>(msgListUrl)
    .pipe(map(response => response.array));
  }

  getQuestionResponse(msg): Observable<ChatMessage[]> {
    const { sensor: { type, q_id }, message } = msg;
    let url = "https://learner.now.sh/api/";
    // let url = "http://localhost:8200/api/";
    if (type === "question") {
      url = `${url}question?question=${message}`;
    } else if(type === "answer") {
      url = `${url}answer?answer=${message}&question_id=${q_id}`;
    } else {
      return message;
    }
    return this.http.get<any>(url)
    .pipe(map(response => response));
  }

  sendMsg(msg: ChatMessage) {
    return new Promise(resolve => setTimeout(() => {
      if (msg.sensor.type) {
        this.getQuestionResponse(msg)
        .subscribe(res => {
          console.log('re', res)
          resolve(res)
        })
      } else {
        resolve(msg)
      }
    }, Math.random() * 1000))
    .then((res) => {
      this.mockNewMsg(res)
    });
  }

  getUserInfo(): Promise<UserInfo> {
    const userInfo: UserInfo = {
      id: '140000198202211138',
      name: 'Emon',
      avatar: './assets/emon.jpg'
    };
    return new Promise(resolve => resolve(userInfo));
  }

}
