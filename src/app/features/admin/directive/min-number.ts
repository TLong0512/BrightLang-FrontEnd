import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[minNumber]',
  standalone: true
})
export class MinNumberDirective {
  @Input('minNumber') minNumber = 1; // mặc định = 50

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);

    if (isNaN(value)) {
      input.value = '';
      return;
    }

    if (value < this.minNumber) {
      input.value = this.minNumber.toString();
    }
  }
}
