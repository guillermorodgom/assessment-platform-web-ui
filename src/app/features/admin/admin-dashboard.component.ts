import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CuestionarioHttpService } from '../../core/services/cuestionario-http.service';
import { CuestionarioResponse } from '../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  cuestionarios: CuestionarioResponse[] = [];
  activos = 0;
  totalPreguntas = 0;

  constructor(private cuestionarioService: CuestionarioHttpService) {}

  ngOnInit(): void {
    this.cuestionarioService.getAll().subscribe(data => {
      this.cuestionarios = data;
      this.activos = data.filter(c => c.activo).length;
      this.totalPreguntas = data.reduce((sum, c) => sum + c.cantidadPreguntas, 0);
    });
  }
}
