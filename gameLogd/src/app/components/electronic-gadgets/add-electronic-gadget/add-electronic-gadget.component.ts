import { Component, inject } from '@angular/core';
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
export class AddElectronicGadgetComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private electronicGadgetService = inject(ElectronicGadgetFirebaseService);

  electronicGadgetForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    imageUrl: ['', [Validators.required]],
    price: ['', [Validators.required, Validators.min(0)]],
    brand: ['', [Validators.required]],
    category: ['', [Validators.required]],
    specifications: this.fb.group({
      processor: [''],
      ram: [''],
      storage: [''],
      display: [''],
      battery: ['']
    }),
    features: this.fb.array([])
  });

  onSubmit() {
    if (this.electronicGadgetForm.valid) {
      const newGadget: ElectronicGadget = {
        ...this.electronicGadgetForm.value,
        rating: 0,
        reviews: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.electronicGadgetService.addElectronicGadget(newGadget)
        .then(() => {
          this.router.navigate(['/electronic-gadgets']);
        })
        .catch(error => {
          console.error('Error adding electronic gadget:', error);
        });
    }
  }
} 