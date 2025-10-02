// src/app/view/view.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataService } from '../services/data-service';
import { Thing } from '../models/thing-model';
import { Auth, User as FirebaseUser, authState } from '@angular/fire/auth';
import { Title } from '@angular/platform-browser'

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './view.html',
  styleUrls: ['./view.css']
})
export class View implements OnInit {
  thing: Thing | null = null;
  ownerDisplayName: string = 'Carregando...';
  currentUser: FirebaseUser | null = null;
  isOwner: boolean = false;
  siteName = "NgCRUD";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private auth: Auth,
    private titleService: Title
  ) { }

  ngOnInit(): void {
    const thingId = this.route.snapshot.paramMap.get('id');
    if (!thingId) {
      this.router.navigate(['/home']);
      return;
    }

    // 1. Obtém o usuário logado
    authState(this.auth).subscribe(user => {
      this.currentUser = user;
    });

    this.dataService.getThingById(thingId).subscribe(thing => {
      this.thing = thing;

      if (!this.thing || this.thing.status !== 'ON') {
        this.router.navigate(['/home']);
        return;
      }

      // Definir o título da página
      this.titleService.setTitle(`${this.siteName} - ${this.thing.name}`);

      // 2. Verifica se o usuário logado é o proprietário
      if (this.currentUser && this.thing.owner === this.currentUser.uid) {
        this.isOwner = true;
      }

      this.dataService.getUserById(this.thing.owner).subscribe(user => {
        if (user) {
          this.ownerDisplayName = user.displayName;
        } else {
          this.ownerDisplayName = 'Usuário não encontrado';
        }
      });
    });
  }

  // 3. Método para lidar com o clique no botão "Apagar"
  onDeleteThing(): void {
    if (confirm('Tem certeza que deseja apagar este item?')) {
      if (this.thing && this.isOwner) {
        this.dataService.updateThingStatus(this.thing.id, 'OFF').subscribe({
          next: () => {
            console.log('Item apagado com sucesso.');
            this.router.navigate(['/home']);
          },
          error: (err) => {
            console.error('Erro ao apagar o item:', err);
            alert('Erro ao apagar o item. Tente novamente.');
          }
        });
      }
    }
  }
}