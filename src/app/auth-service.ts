// src/app/auth-service.ts

import { Injectable } from '@angular/core';
import { Auth, authState, GoogleAuthProvider, signInWithPopup, signOut } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService{
  public user$: Observable<User | null>;

  constructor(private auth: Auth) {
    this.user$ = authState(this.auth);
  }

  loginWithGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  logout() {
    return signOut(this.auth);
  }
}