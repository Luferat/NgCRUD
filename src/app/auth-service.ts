// src/app/auth-service.ts
import { Injectable } from '@angular/core';
import { Auth, authState, GoogleAuthProvider, signInWithPopup, signOut } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Observable, from, switchMap, map, defer } from 'rxjs';
import { User } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user$: Observable<User | null>;

  constructor(private auth: Auth, private firestore: Firestore) {
    this.user$ = defer(() => authState(this.auth)).pipe( // Usa defer para adiar a criação do Observable
      switchMap(user => {
        if (!user) {
          return new Observable<null>(observer => observer.next(null));
        }
        const userDocRef = doc(this.firestore, 'Users', user.uid);
        return from(getDoc(userDocRef)).pipe(
          switchMap(userDoc => {
            const timestamp = new Date().toISOString();
            if (!userDoc.exists()) {
              const userData = {
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                uid: user.uid,
                lastLoginAt: timestamp,
                role: 'user',
                status: 'ON',
                createdAt: timestamp
              };
              return from(setDoc(userDocRef, userData)).pipe(
                map(() => user)
              );
            } else {
              const updatedUserData = {
                lastLoginAt: timestamp
              };
              return from(setDoc(userDocRef, updatedUserData, { merge: true })).pipe(
                map(() => user)
              );
            }
          })
        );
      })
    );
  }

  // Métodos de login e logout (mantidos como antes)
  loginWithGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  logout() {
    return signOut(this.auth);
  }
}