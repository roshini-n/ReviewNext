import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ElectronicGadgetFirebaseService } from '../../../services/electronicGadgetFirebase.service';
import { ElectronicGadget } from '../../../models/electronic-gadget.model';

@Component({
  selector: 'app-add-electronic-gadget',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './add-electronic-gadget.component.html',
  styleUrls: ['./add-electronic-gadget.component.css']
})
export class AddElectronicGadgetComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private electronicGadgetService = inject(ElectronicGadgetFirebaseService);

  electronicGadgetForm: FormGroup;
  isSubmitting = false;

  constructor() {
    this.electronicGadgetForm = this.fb.group({
      title: ['', Validators.required],
      brand: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      imageUrl: ['', Validators.required],
      specifications: this.fb.group({
        processor: [''],
        ram: [''],
        storage: [''],
        display: [''],
        battery: ['']
      })
    });
  }

  ngOnInit(): void {
    // Additional initialization logic if needed
  }

  onSubmit(): void {
    if (this.electronicGadgetForm.valid) {
      const gadgetData = this.electronicGadgetForm.value;
      this.electronicGadgetService.addElectronicGadget(gadgetData)
        .then(() => {
          this.router.navigate(['/electronic-gadgets']);
        })
        .catch((error: Error) => {
          console.error('Error adding electronic gadget:', error);
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/electronic-gadgets']);
  }
} 