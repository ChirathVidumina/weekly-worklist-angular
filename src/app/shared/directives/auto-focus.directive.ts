import { Directive, ElementRef, Input, OnInit, inject, booleanAttribute } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]',
  standalone: true
})
export class AutoFocusDirective implements OnInit {
  private readonly el = inject(ElementRef);

  @Input({ transform: booleanAttribute }) appAutoFocus = true;
  @Input() focusDelay = 50;

  ngOnInit(): void {
    if (this.appAutoFocus) {
      setTimeout(() => {
        this.el.nativeElement.focus?.();
        if (this.el.nativeElement.select) {
          this.el.nativeElement.select();
        }
      }, this.focusDelay);
    }
  }
}
