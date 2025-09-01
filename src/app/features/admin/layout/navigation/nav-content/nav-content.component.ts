// Angular import
import { Component, OnInit, output, inject, Inject, PLATFORM_ID, DOCUMENT } from '@angular/core';
import { isPlatformBrowser, Location } from '@angular/common';
import { RouterModule } from '@angular/router';

//theme version

// project import
import { NavigationItem, NavigationItems } from '../navigation';

import { NavCollapseComponent } from './nav-collapse/nav-collapse.component';
import { NavGroupComponent } from './nav-group/nav-group.component';
import { NavItemComponent } from './nav-item/nav-item.component';
import { SharedModule } from '../../../../../shared/shared.module';

// NgScrollbarModule

@Component({
  selector: 'app-nav-content',
  imports: [RouterModule, NavCollapseComponent, NavGroupComponent, NavItemComponent, SharedModule],
  templateUrl: './nav-content.component.html',
  styleUrl: './nav-content.component.scss'
})
export class NavContentComponent implements OnInit {
  private location = inject(Location);

  // public props
  NavCollapsedMob = output();
  SubmenuCollapse = output();

  // version
  title = 'Demo application for version numbering';

  navigations!: NavigationItem[];
  windowWidth: number;

  // Constructor

  constructor(@Inject(PLATFORM_ID) private platformId: Object, @Inject(DOCUMENT) private document: Document) {
    this.navigations = NavigationItems;
    this.windowWidth = 0
    if (isPlatformBrowser(this.platformId)) {
      this.windowWidth = window.innerWidth;
    } 
  }

  // Life cycle events
  ngOnInit() {
  if (this.windowWidth < 1025) {
    setTimeout(() => {
      const navBar = this.document.querySelector('.coded-navbar') as HTMLElement | null;
      if (navBar) {
        navBar.classList.add('menupos-static');
      }
    }, 500);
  }
}


  fireOutClick() {
  let current_url = this.location.path();

  // eslint-disable-next-line
  // @ts-ignore
  if (this.location['_baseHref']) {
    // eslint-disable-next-line
    // @ts-ignore
    current_url = this.location['_baseHref'] + this.location.path();
  }

  // ⚡ Dùng querySelector an toàn, chú ý bỏ khoảng trắng dư
  const linkSelector = `a.nav-link[href='${current_url}']`;
  const ele = this.document.querySelector(linkSelector) as HTMLElement | null;

  if (!ele) {
    console.warn(`[DEBUG fireOutClick] Không tìm thấy link với href=${current_url}`);
    return;
  }

  const parent = ele.parentElement;
  const up_parent = parent?.parentElement?.parentElement ?? null;
  const last_parent = up_parent?.parentElement ?? null;

  if (parent?.classList?.contains('coded-hasmenu')) {
    parent.classList.add('coded-trigger', 'active');
  } else if (up_parent?.classList?.contains('coded-hasmenu')) {
    up_parent.classList.add('coded-trigger', 'active');
  } else if (last_parent?.classList?.contains('coded-hasmenu')) {
    last_parent.classList.add('coded-trigger', 'active');
  }
}

}
