import { Subject } from 'rxjs';
import { AuthData } from './auth-data.model';
import { User } from './user.model';

export class AuthService {
  private user!: User | null;
  authChange = new Subject<boolean>();

  constructor() {}

  registerUser(authData: AuthData) {
    this.user = {
      email: authData.email,
      userId: Math.round(Math.random() * 1000).toString(),
    };
    this.authChange.next(true);
  }

  login(authData: AuthData) {
    this.user = {
      email: authData.email,
      userId: Math.round(Math.random() * 1000).toString(),
    };
    this.authChange.next(true);
  }
  logout() {
    this.user = null;
    this.authChange.next(false);
  }
  getUser() {
    // I return a new object to prevent this object, passed as reference, to be changed from other part of the code
    return { ...this.user };
  }
  isAuth() {
    return this.user !== null;
  }
}
