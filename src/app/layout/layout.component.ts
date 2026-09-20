import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { NgIconComponent } from '@ng-icons/core';
import { AuthService } from '../core/services/auth.service';
import { UserInfoResponse } from '../core/models';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive,
    ButtonModule, AvatarModule, TooltipModule,
    DialogModule, InputTextModule, TagModule, NgIconComponent
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  menuItems: MenuItem[] = [];
  username = '';
  userInitial = '';
  profileVisible = false;
  sidebarCollapsed = false;

  profileName = '';
  profileUsername = '';
  profileEmail = '';
  profileRoles: string[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.username = user?.nombreCompleto || user?.username || 'Usuario';
    this.userInitial = this.username.charAt(0).toUpperCase();
    this.loadProfile(user);
    this.buildMenu();
  }

  openProfile(): void {
    const user = this.authService.getCurrentUser();
    this.loadProfile(user);
    this.profileVisible = true;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
  }

  private loadProfile(user: UserInfoResponse | null): void {
    this.profileName = user?.nombreCompleto || '';
    this.profileUsername = user?.username || '';
    this.profileEmail = user?.email || '';
    this.profileRoles = user?.roles || [];
  }

  private buildMenu(): void {
    const roles = this.authService.getUserRoles();

    if (roles.includes('ADMIN')) {
      this.menuItems = [
        {
          label: 'Dashboard',
          icon: 'pi pi-home',
          routerLink: '/admin'
        },
        {
          label: 'Cuestionarios',
          icon: 'pi pi-list',
          routerLink: '/admin/cuestionarios'
        },
        {
          label: 'Banco de Preguntas',
          icon: 'pi pi-database',
          routerLink: '/admin/banco-preguntas'
        },
        {
          label: 'Usuarios',
          icon: 'pi pi-users',
          routerLink: '/admin/usuarios'
        },
        {
          label: 'Evaluados',
          icon: 'pi pi-id-card',
          routerLink: '/admin/candidatos'
        }
      ];
    } else {
      this.menuItems = [
        {
          label: 'Evaluaciones',
          icon: 'pi pi-book',
          routerLink: '/assessments'
        }
      ];
    }
  }
}
