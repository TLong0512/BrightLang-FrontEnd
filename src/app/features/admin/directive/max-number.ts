import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[maxNumber]',
  standalone: true
})
export class MaxNumberDirective {
  @Input('maxNumber') maxNumber = 50; // mặc định = 50

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);

    if (isNaN(value)) {
      input.value = '';
      return;
    }

    if (value > this.maxNumber) {
      input.value = this.maxNumber.toString();
    }
  }
}
