// Angular import
import { Component, DOCUMENT, Inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Project import
import { NavigationItem } from '../../navigation';

@Component({
  selector: 'app-nav-item',
  imports: [CommonModule, RouterModule],
  templateUrl: './nav-item.component.html',
  styleUrl: './nav-item.component.scss'
})
export class NavItemComponent {
  // public props
  constructor(@Inject(DOCUMENT) private document: Document) { }

  @Input() item!: NavigationItem;

  // public method
  closeOtherMenu(event: MouseEvent) {
    const ele = event.target as HTMLElement | null;
    if (!ele) return;

    const parent = ele.parentElement;
    const up_parent = parent?.parentElement?.parentElement ?? null;
    const last_parent = up_parent?.parentElement?.parentElement ?? null;

    if (last_parent?.classList?.contains('coded-submenu')) {
      up_parent?.classList.remove('coded-trigger', 'active');
    } else {
      const sections = this.document.querySelectorAll('.coded-hasmenu');
      sections.forEach((section) => {
        section.classList.remove('active', 'coded-trigger');
      });
    }

    if (parent?.classList?.contains('coded-hasmenu')) {
      parent.classList.add('coded-trigger', 'active');
    } else if (up_parent?.classList?.contains('coded-hasmenu')) {
      up_parent.classList.add('coded-trigger', 'active');
    } else if (last_parent?.classList?.contains('coded-hasmenu')) {
      last_parent.classList.add('coded-trigger', 'active');
    }

    const navEl = this.document.querySelector('app-navigation.coded-navbar') as HTMLDivElement | null;
    if (navEl?.classList?.contains('mob-open')) {
      navEl.classList.remove('mob-open');
    } else if (!navEl) {
      console.warn('[DEBUG] Không tìm thấy app-navigation.coded-navbar');
    }
  }

}
