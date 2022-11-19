import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { TrainingService } from '../training/training.service';
import { AuthData } from './auth-data.model';

@Injectable()
export class AuthService {
  private isAuthenticated = false;
  authChange = new Subject<boolean>();

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth,
    private trainingService: TrainingService
  ) {}

  /*
      it is called when the app starts, that is
      in the App component because this is the very first
      component tha get instantiated
  */
  initAuthListener() {
    // emit an event whenever the authentication status changes
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        // if user is authenticated
        this.isAuthenticated = true;
        this.authChange.next(true);
        this.router.navigate(['/training']);
      } else {
        // I execute the code I had in the logout function
        this.trainingService.cancelSubscriptions();
        this.authChange.next(false);
        this.router.navigate(['/login']);
        this.isAuthenticated = false;
      }
    });
  }

  registerUser(authData: AuthData) {
    this.afAuth
      .createUserWithEmailAndPassword(authData.email, authData.password)
      .then((result) => {
        console.log('auth create user result', result);
      })
      .catch((error) => console.log('error', error));
  }

  login(authData: AuthData) {
    this.afAuth
      .signInWithEmailAndPassword(authData.email, authData.password)
      .then((result) => {
        console.log('auth login user result', result);
      })
      .catch((error) => console.log('error', error));
  }

  logout() {
    this.afAuth.signOut();
  }

  isAuth = () => this.isAuthenticated;
}
