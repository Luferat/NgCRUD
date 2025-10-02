// src/app/save-thing/save-thing.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Imports para Reactive Forms
import { Title } from '@angular/platform-browser';
import { DataService } from '../services/data-service';
import { Auth, authState, User as FirebaseUser } from '@angular/fire/auth';
import { take } from 'rxjs'; // Adicione o 'take' para garantir que a inscrição termine

@Component({
  selector: 'app-save-thing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Importe o ReactiveFormsModule
  templateUrl: './save-thing.html',
  styleUrls: ['./save-thing.css']
})
export class SaveThing implements OnInit {
  thingForm!: FormGroup;
  isEditMode: boolean = false;
  thingId: string | null = null;
  currentUser: FirebaseUser | null = null;
  formTitle: string = 'Cadastrar Nova Coisa';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private dataService: DataService,
    private titleService: Title,
    private auth: Auth
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    // 1. Obtém o usuário logado (necessário para o ownerId no save)
    authState(this.auth).pipe(take(1)).subscribe(user => {
      this.currentUser = user;
      if (!user) {
        // Opcional: Redirecionar para login se necessário
        // this.router.navigate(['/login']); 
      }
    });

    // 2. Verifica se está no modo EDITAR
    this.thingId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.thingId;

    if (this.isEditMode && this.thingId) {
      this.loadThingData(this.thingId);
      this.formTitle = 'Editar Coisa';
      this.titleService.setTitle('Editar Item | NGCRUD');
    } else {
      this.titleService.setTitle('Novo Item | NGCRUD');
    }
  }

  // Inicializa o formulário com validações
  initForm(): void {
    this.thingForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      location: ['', [Validators.required]],
      photoURL: ['', [Validators.required, Validators.pattern('https?://.+')]],
      // Campos que são apenas para leitura ou controlados pelo back-end não precisam estar no form
    });
  }

  // Carrega os dados do item se estiver em modo EDITAR
  loadThingData(id: string): void {
    this.dataService.getThingById(id).pipe(take(1)).subscribe(thing => {
      if (thing) {
        // Redireciona se o item não for do usuário logado (Regra de segurança)
        if (this.currentUser && thing.owner !== this.currentUser.uid) {
          alert('Você não tem permissão para editar este item.');
          this.router.navigate(['/home']);
          return;
        }

        // Preenche o formulário com os dados do item existente
        this.thingForm.patchValue({
          name: thing.name,
          description: thing.description,
          location: thing.location,
          photoURL: thing.photoURL,
        });
      } else {
        // Redireciona se o ID for inválido
        this.router.navigate(['/home']);
      }
    });
  }

  // Trata o envio do formulário
  // Trata o envio do formulário
  onSubmit(): void {
    if (this.thingForm.invalid || !this.currentUser) {
      alert('Formulário inválido ou usuário não autenticado.');
      return;
    }

    const formValue = this.thingForm.value;

    // **MUDANÇA CRÍTICA 1:**
    // O item a ser salvo agora é APENAS o payload do formulário.
    // O ID, status, owner, etc. NÃO devem estar aqui.
    const itemToSave = {
      ...formValue,
      // photoURL: formValue.photoURL // Exemplo: se o campo for tratado no TS
    };

    const ownerId = this.currentUser.uid;
    const currentThingId = this.isEditMode ? this.thingId : null; // Passa o ID se for edição

    // **MUDANÇA CRÍTICA 2:**
    // Chama o serviço passando o ID (ou null) e os dados a serem atualizados
    this.dataService.saveThing(currentThingId, itemToSave, ownerId).subscribe({
      next: (savedId) => {
        alert(`Item ${this.isEditMode ? 'atualizado' : 'cadastrado'} com sucesso! ID: ${savedId}`);
        this.router.navigate(['/view', savedId]);
      },
      error: (err) => {
        console.error('Erro ao salvar o item:', err);
        alert('Ocorreu um erro ao salvar o item.');
      }
    });
  }
}