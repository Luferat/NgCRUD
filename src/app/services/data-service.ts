// src/app/services/data-service.ts

import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, where, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Thing } from '../models/thing-model';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private firestore: Firestore) {}

  getThings(): Observable<Thing[]> {
    // 1. Defina um conversor para mapear os dados do Firestore para a interface Thing.
    const thingConverter = {
      // fromFirestore: Recebe um DocumentSnapshot e retorna um objeto do tipo Thing.
      fromFirestore: (snapshot: any): Thing => {
        const data = snapshot.data();
        return {
          id: snapshot.id, // O ID não está nos dados, mas no snapshot
          name: data.name,
          description: data.description,
          location: data.location,
          photoURL: data.photoURL,
          createdAt: data.createdAt,
          owner: data.owner,
          status: data.status,
          metadata: data.metadata,
        };
      },
      
      // toFirestore: Recebe um objeto Thing e retorna os dados para salvar no Firestore.
      toFirestore: (thing: Thing) => ({
        name: thing.name,
        description: thing.description,
        location: thing.location,
        photoURL: thing.photoURL,
        createdAt: thing.createdAt,
        owner: thing.owner,
        status: thing.status,
        metadata: thing.metadata,
      })
    };

    const thingsCollection = collection(this.firestore, 'Things');

    // 2. Aplique o conversor à coleção.
    const thingsQuery = query(
      thingsCollection,
      where('status', '==', 'ON'),
      orderBy('createdAt', 'desc')
    ).withConverter(thingConverter); // Aplique o conversor aqui

    // 3. collectionData agora usa a consulta com o conversor.
    return collectionData<Thing>(thingsQuery);
  }
}