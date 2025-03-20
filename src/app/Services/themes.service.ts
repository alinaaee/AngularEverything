import { effect, Injectable, signal } from '@angular/core';

export interface Theme{
  id: string; //the color names
  primary: string; //the hex code you used while generating 
  displayName: string; //selector
}

@Injectable({
  providedIn: 'root'
})
export class ThemesService {
  private readonly themes: Theme[] = [
    { id: 'blue', primary: '#2980B9', displayName: 'blue'},
    { id: 'green', primary: '#1ABC9C', displayName: 'green'},
    { id: 'pink', primary: '#FF69B4', displayName: 'pink'},
    { id: 'purple', primary: '#8E44AD', displayName: 'purple'},
    { id: 'yellow', primary: '#FFB300', displayName: 'yellow'},
    { id: 'red', primary: '#BF360C', displayName: 'red'}
  ]
  constructor() { }

  currentTheme = signal<Theme>(this.themes[0]);//default
  
  //gets all the themes
  getThemes(): Theme[]{
    return this.themes;
  }

  //uses the name of theme to find and then sets the theme
  setTheme(themeId: string): void {
    const theme = this.themes.find((t) => t.id === themeId);
    if(theme){ 
      console.log('Curr th: ', this.currentTheme());
      this.currentTheme.set(theme);
    }
  }

  //to update the class according to the current theme
    //effect gets the current theme first and then removes any prev themes that has been set on it
    //and then sets the new theme with the id and the name 
  updateThemeClass = effect(() => {
    const theme = this.currentTheme();
    console.log('theme: ',theme);
    document.body.classList.remove(...this.themes.map((t) => `${t.id}-theme`));
    document.body.classList.add(`${theme.id}-theme`);
  })
}
