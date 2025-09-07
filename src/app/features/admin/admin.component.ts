// Angular import
import { AfterViewInit, Component, Inject, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, Location, LocationStrategy } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

// Project import

import { ConfigurationComponent } from './layout/configuration/configuration.component';
import { NavBarComponent } from './layout/nav-bar/nav-bar.component';
import { NavigationComponent } from './layout/navigation/navigation.component';
import { BerryConfig } from '../../../app-config';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, NavigationComponent, NavBarComponent, RouterModule],
  templateUrl: './admin.component.html'
})
export class AdminComponent implements AfterViewInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {



  }
  private location = inject(Location);
  private locationStrategy = inject(LocationStrategy);
  cdr = inject(ChangeDetectorRef);

  // public props
  currentLayout!: string;
  navCollapsed = true;
  navCollapsedMob = false;
  windowWidth!: number;

  // Constructor

  // life cycle hook

  ngAfterViewInit() {
    let current_url = this.location.path();
    const baseHref = this.locationStrategy.getBaseHref();
    if (baseHref) {
      current_url = baseHref + this.location.path();
    }

    if (current_url === baseHref + '/layout/theme-compact' || current_url === baseHref + '/layout/box') {
      BerryConfig.isCollapse_menu = true;
    }
    this.windowWidth = 0;
    if (isPlatformBrowser(this.platformId)) {
      this.windowWidth = window.innerWidth;
    }
    this.navCollapsed = this.windowWidth >= 1025 ? BerryConfig.isCollapse_menu : false;
    this.cdr.detectChanges();
  }

  // private method
  private isThemeLayout(layout: string) {
    this.currentLayout = layout;
  }

  // public method
  navMobClick() {
    const navEl = document.querySelector('app-navigation.coded-navbar');
    const sidebarEl = document.querySelector('app-navigation.pc-sidebar');

    if (this.navCollapsedMob && !(navEl?.classList.contains('mob-open'))) {
      this.navCollapsedMob = !this.navCollapsedMob;
      setTimeout(() => {
        this.navCollapsedMob = !this.navCollapsedMob;
      }, 100);
    } else {
      this.navCollapsedMob = !this.navCollapsedMob;
    }

    if (sidebarEl?.classList.contains('navbar-collapsed')) {
      sidebarEl.classList.remove('navbar-collapsed');
    }
  }


  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeMenu();
    }
  }

  closeMenu() {
    const sidebarEl = document.querySelector('app-navigation.pc-sidebar');
    if (sidebarEl?.classList.contains('mob-open')) {
      sidebarEl.classList.remove('mob-open');
    }
  }

}
