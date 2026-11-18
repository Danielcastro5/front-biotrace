import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { NavbarComponent } from './shared/components/navbar.component';
import { SidebarComponent } from './shared/components/sidebar.component';
import { AuthService } from './core/services/auth.service';
import { UiStateService } from './core/services/ui-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-layout" [class.app-layout--authenticated]="showShell()">
      <!-- Barra Superior Permanente (Solo activa cuando se navega dentro del sistema autenticado) -->
      <app-navbar *ngIf="showShell()"></app-navbar>

      <!-- Layout Central para Usuarios Autenticados (Sidebar Maestro + Viewport) -->
      <div class="app-body" *ngIf="showShell(); else standaloneLayout">
        <app-sidebar></app-sidebar>
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Layout de Pantalla Completa Limpio para Inicio de Sesión o Páginas Autónomas -->
      <ng-template #standaloneLayout>
        <main class="main-content-full">
          <router-outlet></router-outlet>
        </main>
      </ng-template>
    </div>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--titanium-50, #f8fafc);
    }

    .app-body {
      display: flex;
      flex: 1;
      min-height: calc(100vh - 68px);
      position: relative;
    }

    .main-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      background: #f8fafc;
    }

    .main-content-full {
      flex: 1;
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 100vh;
    }
  `],
})
export class AppComponent {
  auth = inject(AuthService);
  ui = inject(UiStateService);
  private router = inject(Router);

  // Señal que indica si la ruta activa es la de login/acceso
  isLoginRoute = signal<boolean>(false);

  // El cascarón de navegación (navbar superior + sidebar lateral) se muestra ESTRICTAMENTE cuando:
  // 1. Hay un usuario y token válidos autenticados
  // 2. La ruta NO es /login ni la raíz pendiente de redirección
  showShell = computed(() => this.auth.isAuthenticated() && !this.isLoginRoute());

  constructor() {
    this.checkRoute(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.checkRoute(event.urlAfterRedirects || event.url);
      });
  }

  private checkRoute(url: string) {
    if (!url) {
      this.isLoginRoute.set(false);
      return;
    }
    const cleanUrl = url.split('?')[0].split('#')[0];
    const isLogin = cleanUrl === '/login' || cleanUrl === '/' || cleanUrl === '';
    this.isLoginRoute.set(isLogin);
  }
}
