// Angular import
import { Component, Inject, output, PLATFORM_ID } from '@angular/core';

// project import

import { NavLeftComponent } from './nav-left/nav-left.component';
import { NavLogoComponent } from './nav-logo/nav-logo.component';
import { NavRightComponent } from './nav-right/nav-right.component';
import { BerryConfig } from '../../../../../app-config';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-nav-bar',
  imports: [NavLogoComponent, NavLeftComponent, NavRightComponent],
  templateUrl: './nav-bar.component.html'
})
export class NavBarComponent {
  // public props
  NavCollapse = output();
  NavCollapsedMob = output();
  navCollapsed: boolean;
  windowWidth: number;
  navCollapsedMob: boolean;

  // Constructor
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.windowWidth = 0
    this.navCollapsed = false
    this.navCollapsedMob = false
    if (isPlatformBrowser(this.platformId)) {
      this.windowWidth = window.innerWidth;
    }
    this.navCollapsed = this.windowWidth >= 1025 ? BerryConfig.isCollapse_menu : false;
  }
  

  // public method
  navCollapse() {
    if (this.windowWidth >= 1025) {
      this.navCollapsed = !this.navCollapsed;
      this.NavCollapse.emit();
    }
  }

  navCollapseMob() {
    if (this.windowWidth < 1025) {
      this.NavCollapsedMob.emit();
    }
  }
}
