// Angular import
import { Component, DOCUMENT, Inject, output, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';

// project import

import { NavContentComponent } from './nav-content/nav-content.component';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-navigation',
  imports: [NavContentComponent, RouterModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {
  // public props
  NavCollapsedMob = output();
  SubmenuCollapse = output();
  navCollapsedMob = false;
  windowWidth: number;
  constructor(@Inject(PLATFORM_ID) private platformId: Object, @Inject(DOCUMENT) private document: Document) {
    this.windowWidth = 0
    if (isPlatformBrowser(this.platformId)) {
      this.windowWidth = window.innerWidth;
    }
    
  }
  
  themeMode!: string;

  // public method
  navCollapseMob() {
    if (this.windowWidth < 1025) {
      this.NavCollapsedMob.emit();
    }
  }

  navSubmenuCollapse() {
    this.document.querySelector('app-navigation.coded-navbar')?.classList.add('coded-trigger');
  }
}
