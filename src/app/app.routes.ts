import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Contacts } from './contacts/contacts';
import { About } from './about/about';

export const routes: Routes = [
    // Rotas vazias redirecionam para a `/home` ← Sempre a primeira
    { path: '', redirectTo: '/home', pathMatch: 'full' },

    // Páginas { rota, componente, título }
    { path: 'home', component: Home, title: 'NgCRUD' },
    { path: 'contacts', component: Contacts, title: 'NgCRUD - Faça Contato' },
    { path: 'about', component: About, title: 'NgCRUD - Sobre' },

    // Rota coringa para redirecionar caminhos inválidos ← Sempre a última
    { path: '**', redirectTo: '/home' }
];