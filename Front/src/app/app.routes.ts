import { Routes } from '@angular/router';
import { HomeComponent } from './Components/home/home.component';
import { AddGameComponent } from './Components/add-game/add-game.component';
import { SettingsComponent } from './Components/settings/settings.component';

export const routes: Routes = [

    {
        path: '',
        component: HomeComponent,
        pathMatch: 'full'
    },
    {
        path: 'addgame',
        component: AddGameComponent
    },
    {
        path: 'settings',
        component: SettingsComponent
    }
];
