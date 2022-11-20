import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { UIService } from '../shared/ui.service';
import { TrainingService } from '../training/training.service';
import { AuthData } from './auth-data.model';

@Injectable()
export class AuthService {
  private isAuthenticated = false;
  authChange = new Subject<boolean>();

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth,
    private trainingService: TrainingService,
    private uiService: UIService
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
    this.uiService.loadingStateChanged.next(true);
    this.afAuth
      .createUserWithEmailAndPassword(authData.email, authData.password)
      .then((result) => {
        console.log('auth create user result', result);
        this.uiService.loadingStateChanged.next(false);
      })
      .catch((error) => {
        console.log('error', error);
        this.uiService.loadingStateChanged.next(false);
        // 2nd argument is null because we don't want to set an action
        this.uiService.showSnackbar(error.message, null, 3000);
      });
  }

  login(authData: AuthData) {
    this.uiService.loadingStateChanged.next(true);
    this.afAuth
      .signInWithEmailAndPassword(authData.email, authData.password)
      .then((result) => {
        console.log('auth login user result', result);
        this.uiService.loadingStateChanged.next(false);
      })
      .catch((error) => {
        console.log('error', error);
        this.uiService.loadingStateChanged.next(false);
        this.uiService.showSnackbar(error.message, null, 3000);
      });
  }

  logout() {
    this.afAuth.signOut();
  }

  isAuth = () => this.isAuthenticated;
}
