// src/app/home/home.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data-service';
import { Observable } from 'rxjs';
import { Thing } from '../models/thing-model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  things$!: Observable<Thing[]>;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.things$ = this.dataService.getThings();
  }
}