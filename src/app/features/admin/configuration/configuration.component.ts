// Angular import
import { CommonModule } from '@angular/common';
import { Component, DOCUMENT, Inject, inject, OnInit, Renderer2 } from '@angular/core';
import { BerryConfig } from '../../../../app-config';

// project import

@Component({
  selector: 'app-configuration',
  imports: [CommonModule],
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  renderer = inject(Renderer2);

  // public method
  styleSelectorToggle!: boolean; // open configuration menu
  setFontFamily!: string; // fontFamily

  // life cycle event
  ngOnInit(): void {
    this.setFontFamily = BerryConfig.font_family;
    this.fontFamily(this.setFontFamily);
  }

  // public method
  fontFamily(font: string) {
    this.setFontFamily = font;
    this.renderer.removeClass(this.document.body, 'Roboto');
    this.renderer.removeClass(this.document.body, 'Poppins');
    this.renderer.removeClass(this.document.body, 'Inter');
    this.renderer.addClass(this.document.body, font);
  }
}
