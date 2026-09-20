import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule],
  template: `
    <p-toast></p-toast>
    <router-outlet></router-outlet>
  `,
  styles: [`:host { display: block; height: 100%; }`]
})
export class AppComponent {}
