import { Component, AfterViewInit, Renderer2, ElementRef, ViewChild, Inject, DOCUMENT } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  imports: [RouterLink, RouterModule]
})
export class AdminComponent implements AfterViewInit {

  isMinified = false;
  isCollapsed = false;

  @ViewChild('sidebarToggler', { static: false }) sidebarToggler!: ElementRef;
  @ViewChild('bodyWrapper', { static: false }) bodyWrapper!: ElementRef;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngAfterViewInit(): void {
    this.initSidebar();
  }

  initSidebar() {
    const wrapper = this.bodyWrapper?.nativeElement || this.document.getElementById('body');
    const sidebarToggler = this.sidebarToggler?.nativeElement || this.document.getElementById('sidebar-toggler');
    const sidebarLinks = this.document.querySelectorAll('.sidebar .nav > .has-sub > a');
    const subLinks = this.document.querySelectorAll('.sidebar .nav > .has-sub .has-sub > a');

    const sidebarItems = this.document.querySelectorAll('#sidebar-menu li');

    // Gán sự kiện click cho từng li
    sidebarItems.forEach(item => {
      this.renderer.listen(item, 'click', (e) => {
        // Xóa class active của tất cả li
        sidebarItems.forEach(el => this.renderer.removeClass(el, 'active'));
        // Thêm class active cho li đang click
        this.renderer.addClass(item, 'active');
      });
    });
    // SIDEBAR MENU
    sidebarLinks.forEach(link => {
      this.renderer.listen(link, 'click', (e) => {
        const parent = (link as HTMLElement).parentElement!;
        const siblings = Array.from(parent.parentElement!.children).filter(el => el !== parent);
        siblings.forEach(sib => this.renderer.removeClass(sib, 'expand'));

        if (parent.classList.contains('expand')) {
          this.renderer.removeClass(parent, 'expand');
        } else {
          this.renderer.addClass(parent, 'expand');
        }
      });
    });

    subLinks.forEach(link => {
      this.renderer.listen(link, 'click', () => {
        const parent = (link.parentElement as HTMLElement);
        if (parent.classList.contains('expand')) {
          this.renderer.removeClass(parent, 'expand');
        } else {
          this.renderer.addClass(parent, 'expand');
        }
      });
    });

    // SIDEBAR TOGGLE
    if (sidebarToggler) {
      this.renderer.listen(sidebarToggler, 'click', () => {
        this.handleSidebarToggle(wrapper, sidebarToggler);
      });
    }

    // MOBILE OVERLAY
    this.handleMobileOverlay(wrapper);
  }

  private handleSidebarToggle(wrapper: HTMLElement, sidebarToggler: HTMLElement) {
    if (wrapper?.classList.contains('sidebar-fixed-offcanvas') || wrapper?.classList.contains('sidebar-static-offcanvas')) {
      this.renderer.addClass(sidebarToggler, 'sidebar-offcanvas-toggle');
      this.renderer.removeClass(sidebarToggler, 'sidebar-toggle');

      if (!this.isCollapsed) {
        this.renderer.addClass(wrapper, 'sidebar-collapse');
        this.isCollapsed = true;
        this.isMinified = false;
      } else {
        this.renderer.removeClass(wrapper, 'sidebar-collapse');
        this.renderer.addClass(wrapper, 'sidebar-collapse-out');
        setTimeout(() => this.renderer.removeClass(wrapper, 'sidebar-collapse-out'), 300);
        this.isCollapsed = false;
      }
    }

    if (wrapper?.classList.contains('sidebar-fixed') || wrapper?.classList.contains('sidebar-static')) {
      this.renderer.addClass(sidebarToggler, 'sidebar-toggle');
      this.renderer.removeClass(sidebarToggler, 'sidebar-offcanvas-toggle');

      if (!this.isMinified) {
        this.renderer.removeClass(wrapper, 'sidebar-collapse');
        this.renderer.removeClass(wrapper, 'sidebar-minified-out');
        this.renderer.addClass(wrapper, 'sidebar-minified');
        this.isMinified = true;
        this.isCollapsed = false;
      } else {
        this.renderer.removeClass(wrapper, 'sidebar-minified');
        this.renderer.addClass(wrapper, 'sidebar-minified-out');
        this.isMinified = false;
      }
    }
  }

  private handleMobileOverlay(wrapper: HTMLElement) {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      const sidebarToggleBtns = this.document.querySelectorAll('.sidebar-toggle');
      sidebarToggleBtns.forEach(btn => {
        this.renderer.listen(btn, 'click', () => {
          this.createMobileOverlay(wrapper);
        });
      });
    }
  }

  createMobileOverlay(wrapper: HTMLElement) {
    const overlay = this.renderer.createElement('div');
    this.renderer.addClass(overlay, 'mobile-sticky-body-overlay');

    const removeOverlay = this.renderer.listen(overlay, 'click', () => {
      this.renderer.removeChild(this.document.body, overlay);
      this.renderer.removeClass(wrapper, 'sidebar-mobile-in');
      this.renderer.addClass(wrapper, 'sidebar-mobile-out');
      this.renderer.setStyle(wrapper, 'overflow', 'auto');
      removeOverlay(); // Remove event listener
    });

    this.renderer.insertBefore(this.document.body, overlay, this.document.body.firstChild);
    this.renderer.setStyle(wrapper, 'overflow', 'hidden');
    this.renderer.addClass(wrapper, 'sidebar-mobile-in');
  }

  activeMenu: string = 'thongke'; // default active

  // Hàm chọn menu
  selectMenu(menuId: string) {
    this.activeMenu = menuId;
  }
}