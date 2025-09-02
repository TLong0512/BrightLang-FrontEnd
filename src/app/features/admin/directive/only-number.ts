import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[onlyDigits]',
  standalone: true
})
export class OnlyDigitsDirective {

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'
    ];

    if (!/^[0-9]$/.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }
}
