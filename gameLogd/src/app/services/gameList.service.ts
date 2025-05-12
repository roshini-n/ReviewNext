import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from '@angular/fire/firestore';
import { Observable, from, of, throwError } from 'rxjs';
import { GameList } from '../models/gameList.model';
import { map, catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
  })
export class GameListService {
    firestore = inject(Firestore);
    
    //Get single list by id and return it as an observable
    getListById(id: string): Observable<GameList | undefined> {
        const listDocRef = doc(this.firestore, `gamelists/${id}`);
        console.log(listDocRef); 

        //Grab each attribute and map it to our item if the attribute exists
        return from(getDoc(listDocRef)).pipe(
            map((doc) => {
                console.log(doc);
                if (doc.exists()) {
                    const data = doc.data();
                    console.log(data);
                    console.log(doc);
                    return this.mapToGameListModel({ id: doc.id, ...data });
                }
                return undefined;
            })
        );
    }

    //Get all of one user's lists
    getListsByUserId(id: String): Observable<GameList[]> {
        const listQuery = query(collection(this.firestore, "gamelists"), where("userId", "==", id));

        //Takes our query, then maps the returned data into gamelist objects to be returned as an observable array
        return from(getDocs(listQuery)).pipe(
            map((querySnapshot) => {
                return querySnapshot.docs.map((doc) => {
                    return this.mapToGameListModel({id: doc.id, ...doc.data() });
                });
            })
        );
    }
    
    //Add new list to database
    addList(gameList: Omit<GameList, 'id'>): Observable<String> {
        const listCollection = collection(this.firestore, 'gamelists');
        return from(addDoc(listCollection, gameList)).pipe(
            map(docRef => {
                updateDoc(docRef, { id:docRef.id });
                return docRef.id
            })
        );
    }

    //Update a specific list
    updateList(id: string, gameList: Omit<GameList, 'id'>):Observable<void> {
        const listDoc = doc(this.firestore, `gamelists/${id}`)
        return from(updateDoc(listDoc, gameList));
    }

    //Maps given data into a list object so our models are consistent with firebase
    mapToGameListModel(data: any): GameList {
        return {
            id: data.id || "",
            title: data.title || "",
            description: data.description || "",
            games: Array.isArray(data.games) ? data.games : [],
            userId: data.userId || ""
        }
    }

    //Delete list from database
    deleteList(id: string): Observable<void> {
        const listDoc = doc(this.firestore, `gamelists/${id}`);
        return from(deleteDoc(listDoc));
    }
}
