import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthData } from './auth-data.model';
import { User } from './user.model';

@Injectable()
export class AuthService {
  private user!: User | null;
  authChange = new Subject<boolean>();

  constructor(private router: Router) {}

  registerUser(authData: AuthData) {
    this.user = {
      email: authData.email,
      userId: Math.round(Math.random() * 1000).toString(),
    };
    this.authSuccessfully();
  }

  login(authData: AuthData) {
    this.user = {
      email: authData.email,
      userId: Math.round(Math.random() * 1000).toString(),
    };
    this.authSuccessfully();
  }
  private authSuccessfully() {
    this.authChange.next(true);
    this.router.navigate(['/training']);
  }

  logout() {
    this.user = null;
    this.authChange.next(false);
    this.router.navigate(['/login']);
  }
  getUser() {
    // I return a new object to prevent this object, passed as reference, to be changed from other part of the code
    return { ...this.user };
  }
  isAuth() {
    return !!this.user;
  }
}
