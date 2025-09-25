// src/app/app.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from './auth-service'; // Importe o serviço de autenticação

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  title = 'ngcrud';

  constructor(public authService: AuthService) {} // Injetando o serviço Auth
}