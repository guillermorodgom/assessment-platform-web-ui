import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { PasswordModule } from 'primeng/password';
import { NgIconComponent } from '@ng-icons/core';
import { MessageService, MenuItem } from 'primeng/api';
import { UsuarioHttpService } from '../../../core/services/usuario-http.service';
import { UsuarioResponse, RegisterRequest } from '../../../core/models';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ToolbarModule, ButtonModule,
    DialogModule, InputTextModule, TagModule, TooltipModule,
    ToastModule, BreadcrumbModule, PasswordModule, NgIconComponent
  ],
  templateUrl: './usuario-list.component.html',
  styleUrl: './usuario-list.component.scss'
})
export class UsuarioListComponent implements OnInit {
  usuarios: UsuarioResponse[] = [];
  loading = true;

  dialogVisible = false;
  saving = false;

  username = '';
  password = '';
  email = '';
  nombreCompleto = '';

  breadcrumbItems: MenuItem[] = [
    { label: 'Dashboard', routerLink: '/admin' },
    { label: 'Usuarios' }
  ];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/admin' };

  constructor(
    private usuarioService: UsuarioHttpService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.loading = true;
    this.usuarioService.getAll().subscribe({
      next: data => {
        this.usuarios = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los usuarios' });
      }
    });
  }

  openNew(): void {
    this.username = '';
    this.password = '';
    this.email = '';
    this.nombreCompleto = '';
    this.dialogVisible = true;
  }

  save(): void {
    if (!this.username.trim() || !this.password.trim() || !this.email.trim() || !this.nombreCompleto.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validacion', detail: 'Todos los campos son obligatorios' });
      return;
    }

    this.saving = true;
    const request: RegisterRequest = {
      username: this.username,
      password: this.password,
      email: this.email,
      nombreCompleto: this.nombreCompleto
    };

    this.usuarioService.crear(request).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Evaluado registrado exitosamente' });
        this.dialogVisible = false;
        this.saving = false;
        this.loadUsuarios();
      },
      error: (err) => {
        this.saving = false;
        const detail = err.error?.message || 'No se pudo registrar el evaluado';
        this.messageService.add({ severity: 'error', summary: 'Error', detail });
      }
    });
  }

  getRolSeverity(rol: string): 'success' | 'info' | 'warning' | 'danger' {
    return rol === 'ADMIN' ? 'danger' : 'info';
  }

  formatRol(rol: string): string {
    return rol.replace('ROLE_', '');
  }
}
