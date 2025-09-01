// Angular import
import { Component, DOCUMENT, Inject, Input, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { RouterModule } from '@angular/router';

// project import
import { NavigationItem } from '../../navigation';

import { NavItemComponent } from '../nav-item/nav-item.component';

@Component({
  selector: 'app-nav-collapse',
  imports: [CommonModule, RouterModule, NavItemComponent],
  templateUrl: './nav-collapse.component.html',
  styleUrl: './nav-collapse.component.scss'
})
export class NavCollapseComponent implements OnInit {
  private location = inject(Location);

  windowWidth: number;
  // public props
  @Input() item!: NavigationItem;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, @Inject(DOCUMENT) private document: Document) {
    this.windowWidth = 0
    if (isPlatformBrowser(this.platformId)) {
      this.windowWidth = window.innerWidth;
    }
  }
  current_url = ''; // Add current URL property

  ngOnInit() {
    this.current_url = this.location.path();

    // safer baseHref handling
    const baseHref = (this.location as any)?._baseHref || '';
    this.current_url = baseHref + this.current_url;

    // Wait for DOM to render
    setTimeout(() => {
      const links = this.document.querySelectorAll('a.nav-link') as NodeListOf<HTMLAnchorElement>;
      links.forEach((link: HTMLAnchorElement) => {
        if (link.getAttribute('href') === this.current_url) {
          let parent: HTMLElement | null = link.parentElement;
          while (parent) {
            if (parent.classList?.contains('coded-hasmenu')) {
              parent.classList.add('coded-trigger', 'active');
            }
            parent = parent.parentElement;
          }
        }
      });
    }, 0);
  }


  // Method to handle the collapse of the navigation menu
  navCollapse(e: MouseEvent) {
  let target = e.target as HTMLElement | null;

  if (!target) return;

  // Nếu click vào span thì lấy cha
  if (target.tagName === 'SPAN') {
    target = target.parentElement;
  }

  // parent = thẻ <li> coded-hasmenu
  let parent = target?.parentElement;
  if (!parent) return;

  // Đóng tất cả các menu khác
  const sections = this.document.querySelectorAll('.coded-hasmenu');
  sections.forEach((section) => {
    if (section !== parent) {
      section.classList.remove('coded-trigger');
    }
  });

  // Xử lý khi menu lồng nhau
  let first_parent = parent.parentElement;
  if (first_parent?.classList.contains('coded-hasmenu')) {
    do {
      first_parent.classList.add('coded-trigger');
      first_parent = first_parent.parentElement?.parentElement || null;
    } while (first_parent?.classList.contains('coded-hasmenu'));
  }

  let pre_parent = parent.parentElement?.parentElement || null;
  if (pre_parent?.classList.contains('coded-submenu')) {
    do {
      pre_parent.parentElement?.classList.add('coded-trigger');
      pre_parent = pre_parent.parentElement?.parentElement?.parentElement || null;
    } while (pre_parent?.classList.contains('coded-submenu'));
  }

  // Toggle menu hiện tại
  parent.classList.toggle('coded-trigger');
}

}
