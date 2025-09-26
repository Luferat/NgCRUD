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
  // `user$` é um Observable que emite o estado do usuário (logado ou não).
  // Ele é a fonte de verdade para a UI, que se atualiza automaticamente.
  public user$: Observable<User | null>;
  
  // O construtor injeta os serviços do Firebase (Auth e Firestore)
  // que serão usados em todo o serviço.
  constructor(private auth: Auth, private firestore: Firestore) {
    // Usamos `defer` para adiar a criação do Observable `authState` até que
    // ele seja assinado. Isso resolve o aviso de "injeção de contexto".
    this.user$ = defer(() => authState(this.auth)).pipe(
      // `switchMap` "troca" o Observable de autenticação por um novo Observable
      // de uma operação no Firestore, permitindo encadear chamadas assíncronas.
      switchMap(user => {
        // Se o usuário não está logado, retornamos um Observable que emite 'null'.
        if (!user) {
          return new Observable<null>(observer => observer.next(null));
        }
        
        // Obtenha a referência para o documento do usuário no Firestore, usando o `uid` como ID.
        const userDocRef = doc(this.firestore, 'Users', user.uid);

        // A partir daqui, as chamadas para o Firestore são encadeadas.
        return from(getDoc(userDocRef)).pipe(
          switchMap(userDoc => {
            const timestamp = new Date().toISOString();
            
            // Verifique se o documento do usuário já existe.
            if (!userDoc.exists()) {
              // É o primeiro login: criamos o documento completo.
              const userData = {
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                uid: user.uid,
                lastLoginAt: timestamp,
                role: 'user', // Campo padrão para uso futuro.
                status: 'ON', // Campo padrão para uso futuro.
                createdAt: timestamp
              };
              // `setDoc` com os dados completos para criar o novo documento.
              return from(setDoc(userDocRef, userData)).pipe(
                // Retornamos o objeto 'user' original para continuar o fluxo do Observable.
                map(() => user)
              );
            } else {
              // Login subsequente: atualizamos apenas o campo `lastLoginAt`.
              const updatedUserData = {
                lastLoginAt: timestamp
              };
              // `setDoc` com `merge: true` para atualizar apenas o campo `lastLoginAt`
              // sem apagar os outros dados.
              return from(setDoc(userDocRef, updatedUserData, { merge: true })).pipe(
                // Retornamos o objeto 'user' original para continuar o fluxo.
                map(() => user)
              );
            }
          })
        );
      })
    );
  }

  // Método que inicia o processo de login com o Google.
  loginWithGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  // Método que desconecta o usuário.
  logout() {
    return signOut(this.auth);
  }
}