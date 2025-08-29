// Angular import
import { Component, Input, output, inject, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';
import { isPlatformBrowser } from '@angular/common';

// project import

@Component({
  selector: 'app-nav-logo',
  imports: [SharedModule],
  templateUrl: './nav-logo.component.html',
  styleUrl: './nav-logo.component.scss'
})
export class NavLogoComponent {
  router = inject(Router);

  // public props
  @Input() navCollapsed!: boolean;
  NavCollapse = output();
  windowWidth: number;
  themeMode!: boolean;

  // Constructor
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.windowWidth = 0
    
    if (isPlatformBrowser(this.platformId)) {
      this.windowWidth = window.innerWidth;
    }
  }
  

  // public method
  navCollapse() {
    if (this.windowWidth >= 1025) {
      this.navCollapsed = !this.navCollapsed;
      this.NavCollapse.emit();
    }
  }

  returnToHome() {
    this.router.navigate(['/default']);
  }
}
