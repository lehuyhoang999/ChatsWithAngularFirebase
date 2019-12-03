import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ServiceService } from '../service/service.service';
import { Router } from '@angular/router';
import { User } from '../model/user';
import { map } from 'rxjs/operators';
import { Chat } from '../model/chat';
import { $ } from 'protractor';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit  {

  presence$;
  
  users: User[] = [];

  chats : Chat[] = [];

  chat : Chat = {msg:'',senderid:'',reciveid:'', attachname:'', attachurl:''};

  chatWithUser : User = {email:'',uid:'',imgurl:'',status:''};

  msg : string = "";

  mouse : number;

  listFile : any[] = [];

  constructor(private router : Router ,private service : ServiceService) { 
  }

  ngOnInit() {
    // if(this.isEmtity(this.service.user.email) || this.isEmtity(this.service.user.uid)){
    //   this.router.navigate(['login']);
    // }
    this.presence$ = this.service.getPresence(this.service.user.uid);
    console.log('user$');
    this.service.getUserList().valueChanges().subscribe(elm => {
      this.users = [];
      elm.forEach((user : User) => {
        if(user.uid && (user.uid !== this.service.user.uid)){
          console.log(user.uid);
          this.users.push(user);
        }        
      })
      this.chatWithUser = this.users[0];
    });

    this.service.getChatList().valueChanges().subscribe(elm => {
      this.chats = [];
      elm.forEach((chat : Chat) => {
        if ((chat.senderid === this.service.user.uid) || (chat.reciveid === this.service.user.uid)) {
          this.chats.push(chat);
        }
      });
    });
    
  }

  isEmtity(value: string) : boolean {
    return value.length > 0 ? false : true;
  }

  statusIcon(status : string) : boolean {
    return (status === 'away') || (status === 'offline');
  }

  userSelect(user: User) {
    this.chatWithUser = user;
  }

  selectedUser(user: User) : boolean {
    return this.chatWithUser.uid === user.uid ? true : false;
  }

  showMsgStart(chat : Chat) : boolean{
    return chat.senderid === this.chatWithUser.uid;
  }

  showMsgEnd(chat : Chat) : boolean{
    return chat.reciveid === this.chatWithUser.uid;
  }

  showMsg(chat : Chat) : boolean{
    let len : number = -1;
    if (chat.msg) {
      len = chat.msg.length;
    }
    return  len > 0 ? true : false;
  }

  showAtt(chat : Chat) : boolean{
    let len : number = -1;
    if (chat.attachname) {
      len = chat.attachname.length;
    }
    return  len > 0 ? true : false;
  }


  sendMsg(msg : any) {
    console.log(msg.value);
    this.chat.reciveid = this.chatWithUser.uid;
    this.chat.senderid = this.service.user.uid;
    if (this.listFile.length > 0) {
      this.listFile.forEach(file => {
        this.service.upLoadFile(file, this.chat);
      });
      this.listFile = [];
    }

    if(!this.isEmtity(msg.value)) {
      this.chat.msg = msg.value;
      this.chat.attachname = '';
      this.chat.attachurl = '';
      this.service.senMsg(this.chat);
      msg.value = "";
    }
  }

  hotkey($event) {
    console.log($event);
    if ($event.keyCode === 13) {
      this.sendMsg($event.target);
    }
  }

  onChange(file : any) {
    console.log(file);
    this.listFile.push(file);
  }

  onMouse(i :number) {
    this.mouse = i;
  }

  onMouseOut() {
    this.mouse = -1;
  }
  
  isActive(i : number) : boolean {
    return i === this.mouse ? true : false;
  }
  deleteFileSelected(i : number) {
    this.listFile.splice(i,1);
  }

  download( chat : Chat) {
    window.location.href=chat.attachurl;
  }
}
