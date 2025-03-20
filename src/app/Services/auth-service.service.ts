import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  user = signal<{name: string; loggeIn: boolean} | null>(null);

  login(username :string){
    this.user.set({ name: username, loggeIn: true });
  }

  logout(){
    this.user.set(null);
  }
}
