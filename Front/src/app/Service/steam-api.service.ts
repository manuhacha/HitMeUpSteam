import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SteamAPIService {

  constructor(private http: HttpClient) { }


  getGameByName(gamename:string) {
    return this.http.get<any>('http://localhost:3000/api/v1/game/steam/search?gamename=' + gamename)
  }
  getAllGames() {
    return this.http.get<any>('http://localhost:3000/api/v1/game/');
  }
  addGame(game:any) {
    return this.http.post<any>('http://localhost:3000/api/v1/game/',game);
  }
  deleteGame(id:any) {
    return this.http.delete<any>('http://localhost:3000/api/v1/game/' + id)
  }
}
