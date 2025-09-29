// src/app/services/data-service.ts

import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable, from, map, catchError, throwError } from 'rxjs';
import type { FirestoreDataConverter, Timestamp } from 'firebase/firestore';
import { Thing } from '../models/thing-model';

/**
 * Interface representando o usuário no Firestore.
 * Mantenha alinhado ao shape salvo na collection 'Users'.
 */
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  // Converter reaproveitável para Thing <=> Firestore
  private readonly thingConverter: FirestoreDataConverter<Thing> = {
    // snapshot -> Thing
    fromFirestore: (snapshot): Thing => {
      const data = snapshot.data() as any;

      // Normaliza createdAt: Timestamp -> Date | null
      const rawCreatedAt = data?.createdAt;
      const createdAt = rawCreatedAt && (rawCreatedAt as Timestamp).toDate
        ? (rawCreatedAt as Timestamp).toDate()
        : rawCreatedAt ?? null;

      return {
        id: snapshot.id,
        name: data?.name ?? '',
        description: data?.description ?? '',
        location: data?.location ?? null,
        photoURL: data?.photoURL ?? null,
        createdAt,
        owner: data?.owner ?? null,
        status: data?.status ?? null,
        metadata: data?.metadata ?? null,
      };
    },

    // Thing -> Firestore plain object (usado em gravação)
    toFirestore: (thing: Thing) => ({
      name: thing.name,
      description: thing.description,
      location: thing.location,
      photoURL: thing.photoURL,
      createdAt: thing.createdAt, // se usar Date, o SDK/AngularFire pode converter automaticamente
      owner: thing.owner,
      status: thing.status,
      metadata: thing.metadata,
    })
  };

  constructor(private firestore: Firestore) { }

  /**
   * Lista Things com status 'ON', ordenadas por createdAt desc.
   * Retorna Observable<Thing[]> (stream em tempo-real se collectionData for real-time).
   *
   * Observações:
   * - Mantive seu where/orderBy; se ocorrer erro de index no Firestore, crie o index sugerido pelo console.
   * - Use async pipe nos componentes para unsubscribe automático.
   */
  getThings(): Observable<Thing[]> {
    const thingsCollection = collection(this.firestore, 'Things');

    const thingsQuery = query(
      thingsCollection,
      where('status', '==', 'ON'),
      orderBy('createdAt', 'desc')
    ).withConverter(this.thingConverter);

    // collectionData já retorna Observable — deixei tipado para Thing[].
    return collectionData<Thing>(thingsQuery).pipe(
      // Propaga erro como Observable; o componente deve tratar/subscrever.
      catchError(err => {
        // aqui você pode logar (Sentry/console) antes de propagar
        return throwError(() => err);
      })
    );
  }

  /**
   * Busca um único Thing por id.
   * Retorna Observable<Thing | null>.
   *
   * Notas:
   * - Usa getDoc (fetch one-time). Se precisar de realtime, use docData().
   */
  getThingById(id: string): Observable<Thing | null> {
    const thingRef = doc(this.firestore, 'Things', id).withConverter(this.thingConverter);

    return from(getDoc(thingRef)).pipe(
      map(snapshot => snapshot.exists() ? snapshot.data() as Thing : null),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Busca um usuário pelo uid.
   * Retorna Observable<User | null>.
   *
   * Observação: se o documento Users tiver campos especiais (timestamps, maps),
   * considere criar um converter semelhante ao do Thing.
   */
  getUserById(uid: string): Observable<User | null> {
    const userRef = doc(this.firestore, 'Users', uid);

    return from(getDoc(userRef)).pipe(
      map(snapshot => snapshot.exists() ? snapshot.data() as User : null),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Atualiza apenas o campo 'status' do documento Thing.
   * Retorna Observable<void> que completa quando o update terminar.
   *
   * Boas práticas:
   * - updateDoc falha se o documento não existe: trate isso no componente se necessário.
   * - Para criar/atualizar use setDoc(ref, data, { merge: true }).
   */
  updateThingStatus(id: string, newStatus: string): Observable<void> {
    const thingRef = doc(this.firestore, 'Things', id);
    return from(updateDoc(thingRef, { status: newStatus })).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
