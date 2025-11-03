import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ElectronicGadget } from '../../../models/electronic-gadget.model';

@Component({
  selector: 'app-electronic-gadget-search-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './electronic-gadget-search-list.component.html',
  styleUrl: './electronic-gadget-search-list.component.css'
})
export class ElectronicGadgetSearchListComponent {
  @Input() gadgets: ElectronicGadget[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() emptyMessage = 'No gadgets found.';
}


