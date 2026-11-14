import { Directive, ElementRef, EventEmitter, HostListener, Output, inject } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true
})
export class ClickOutsideDirective {
  private readonly el = inject(ElementRef);

  @Output() appClickOutside = new EventEmitter<MouseEvent>();

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!this.el.nativeElement.contains(target)) {
      this.appClickOutside.emit(event);
    }
  }
}
