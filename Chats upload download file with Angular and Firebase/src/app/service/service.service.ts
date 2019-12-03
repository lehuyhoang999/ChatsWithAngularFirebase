import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { User } from '../model/user';
import { Chat } from '../model/chat';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';
import { of } from 'rxjs';
import { map, mergeMap, delay, mergeAll, switchMap, tap, first, finalize } from 'rxjs/operators';
import * as firebase from 'firebase';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  user: User ={"email": "", "uid": "", "imgurl": "", "status" : ""};

  constructor(private router : Router, private af : AngularFireAuth, 
    private db : AngularFireDatabase, private store : AngularFireStorage, private http : HttpClient) {
    this.updateOnDisconnect().subscribe();
    this.updateOnAway();
  }

  updateOnAway() {
    document.onvisibilitychange = (e) => {
      if (document.visibilityState === 'hidden') {
        this.setPresence('away')
      }else {
        this.setPresence('online');
      }
    };
  }

  async signOut() {
    await this.setPresence('offline');
    await this.af.auth.signOut();
  }

  updateOnDisconnect() {
    return this.af.authState.pipe(
      tap(user => {
        if (user.uid === this.user.uid) {
          console.log(user.uid);
          this.db.object(`Users/${user.uid}`).query.ref.onDisconnect()
          .update({
            status: 'offline',
            timestamp: this.timestamp
          });
        }
      })
    );
  }

  getPresence(uid : string){
    return this.db.object(`Users/${uid}`).valueChanges();
  }

  async setPresence(status: string) {
    const user = await this.getUser();
    if(user.uid.length > 0){
      return this.db.object(`Users/${user.uid}`).update({status, timestamp: this.timestamp})
    }
  }

  get timestamp() {
    return firebase.database.ServerValue.TIMESTAMP;
  }

  getUser() {
    return this.user;
  }

  getUserList() {
    return this.db.list('Users');
  }

  getChatList() {
    return this.db.list('Chats');
  }

  login(name : string, pass : string) {
    this.af.auth.signInWithEmailAndPassword(name,pass).then(
      (success)=>{
         this.user.email = success.user.email;
         this.user.uid = success.user.uid;
         this.db.list('/Users').set(this.user.uid,{'uid': this.user.uid, 'email': this.user.email, 'imgurl':'https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg', 'status': 'online', 'timestamp':this.timestamp}).then(
           (success)=>{
             console.log('login success');
             this.router.navigate(['home']);
           }
         );
      });
  }

  register(name : string, pass : string) {
    this.af.auth.createUserWithEmailAndPassword(name,pass).then(
      (success)=>{
        this.user.email = success.user.email;
        this.user.uid = success.user.uid;
        this.db.list('/Users').set(this.user.uid,{'uid': this.user.uid, 'email': this.user.email, 'imgurl':'', 'status': 'online', 'timestamp':this.timestamp}).then(
         (success)=>{
           console.log('register success');
           this.router.navigate(['home']);
         });
      }
    );
  }

  senMsg(chat : Chat) {
    this.db.list('/Chats').push({senderid: chat.senderid, reciveid: chat.reciveid, msg: chat.msg, timestamp :this.timestamp, attachname: chat.attachname, attachurl: chat.attachurl}).then(
      (success)=>{
        console.log('send success');
      });
  }

  upLoadFile(file : any, chat : Chat) {
    const fileRef = this.store.ref(file.name);
    this.store.upload(file.name,file).snapshotChanges().pipe(
      finalize(()=> {
        fileRef.getDownloadURL().subscribe((url) => {
          console.log(url);
          chat.attachname = file.name;
          chat.attachurl = url;
          chat.msg = '';
          this.senMsg(chat);
        })
      })
    ).subscribe();
  }

}
