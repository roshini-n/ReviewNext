import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-general-delete-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './general-delete-button.component.html',
  styleUrls: ['./general-delete-button.component.css']
})
export class GeneralDeleteButtonComponent {
  @Input() objectToDelete: any; 
  @Output() deleteConfirmed = new EventEmitter<any>(); 

  showModal: boolean = false;

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  confirmDelete() {
    if (this.objectToDelete) {
      this.deleteConfirmed.emit(this.objectToDelete);
    }
    this.closeModal();
  }
}