import {
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Output,
} from "@angular/core";

@Directive({
  selector: "[fileDragDrop]",
  standalone: true,
})
export class FileDragNDropDirective {
  @Output() private filesChangeEmiter: EventEmitter<File> = new EventEmitter();

  @HostBinding("style.background") private background = "#eee";
  @HostBinding("style.border") private borderStyle = "2px dashed";
  @HostBinding("style.border-color") private borderColor = "#f6a420";
  @HostBinding("style.border-radius") private borderRadius = "5px";

  constructor() {}

  @HostListener("dragover", ["$event"]) public onDragOver(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = "lightgray";
    this.borderColor = "#38b44a";
    this.borderStyle = "3px solid";
  }

  @HostListener("dragleave", ["$event"]) public onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = "#eee";
    this.borderColor = "#f6a420";
    this.borderStyle = "2px dashed";
  }

  @HostListener("drop", ["$event"]) public onDrop(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = "#eee";
    this.borderColor = "#f6a420";
    this.borderStyle = "2px dashed";
    const files = evt.dataTransfer?.files;
    if (files) {
      this.filesChangeEmiter.emit(files[0]);
    }
  }
}
