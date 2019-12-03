import { Component, OnInit } from '@angular/core';
import { Persion } from '../model/persion.model';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from '../model/user';
import { AngularFireDatabase } from 'angularfire2/database';
import { ServiceService } from '../service/service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  elements = ["name", "password"];
  validName : boolean = false;
  validPassword : boolean = false;
  persion: Persion = {"name": "", "password": ""};

  constructor(private router : Router, private service : ServiceService) {
  }

  ngOnInit() {
  }

  showLabel(element : string) : string {
    return element.charAt(0).toUpperCase() + element.slice(1);
  }

  disButton() : boolean {
    return !(this.validName && this.validPassword);
  }

  isEmtity(value: string) : boolean {
    return value.length > 0 ? false : true;
  }

  onkeyup(value : string, element : string) {
    if (element === "name") {
      this.persion.name = value;
      this.validName = !this.isEmtity(this.persion.name);
    } else if (element === "password") {
      this.persion.password = value;
      this.validPassword = !this.isEmtity(this.persion.password);
    }
  }

  register() {
    this.router.navigate(['register']);
  }

  submit() {
    this.service.login(this.persion.name, this.persion.password);
  }

}
