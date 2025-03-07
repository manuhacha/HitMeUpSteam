import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SteamAPIService {

  constructor(private http: HttpClient) { }


  getGameByName(gamename:string) {
    return this.http.get<any>('https://store.steampowered.com/api/storesearch/?term=' + gamename + '&cc=es&l=en')
  }
}
