// src/app/app.route.ts

import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Contacts } from './contacts/contacts';
import { About } from './about/about';
import { SeedData } from './seed-data/seed-data';
import { View } from './view/view';
import { SaveThing } from './save-thing/save-thing';

// Nome do site para compor o `title`
const siteName = "NgCRUD";

export const routes: Routes = [
    // Rotas vazias redirecionam para a `/home` ← Sempre a primeira
    { path: '', redirectTo: '/home', pathMatch: 'full' },

    // Páginas { rota, componente, título }
    { path: 'home', component: Home, title: siteName },
    { path: 'contacts', component: Contacts, title: `${siteName} - Faça Contato` },
    { path: 'about', component: About, title: `${siteName} - Sobre` },

    // Página para "popular" a coleção "Things" no Firestore
    { path: 'seed-data', component: SeedData, title: `${siteName} - Cadastro de Coisas` },

    // Página que exibe um item único pelo Id
    { path: 'view/:id', component: View, title: `${siteName} - Ver Item` },

    // Editar e apagar um item
    { path: 'edit/:id', component: SaveThing, title: `${siteName} - Editar Item` }, // Rota para Editar Item
    { path: 'new', component: SaveThing, title: `${siteName} - Cadastrar Item` }, // Rota para Novo Item

    // Rota coringa para redirecionar caminhos inválidos ← Sempre a última
    { path: '**', redirectTo: '/home' }
];