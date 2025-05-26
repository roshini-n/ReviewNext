import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { HomeApplianceFirebaseService } from '../../../services/homeApplianceFirebase.service';
import { HomeAppliance } from '../../../models/home-appliance.model';

@Component({
  selector: 'app-add-home-appliance',
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
  templateUrl: './add-home-appliance.component.html',
  styleUrls: ['./add-home-appliance.component.css']
})
export class AddHomeApplianceComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private homeApplianceService = inject(HomeApplianceFirebaseService);

  homeApplianceForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    imageUrl: ['', [Validators.required]],
    price: ['', [Validators.required, Validators.min(0)]],
    brand: ['', [Validators.required]],
    category: ['', [Validators.required]],
    model: ['', [Validators.required]],
    dimensions: ['', [Validators.required]],
    weight: ['', [Validators.required]],
    powerConsumption: ['', [Validators.required]],
    features: ['', [Validators.required]],
    warranty: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.homeApplianceForm.valid) {
      const newHomeAppliance: HomeAppliance = {
        ...this.homeApplianceForm.value,
        rating: 0,
        totalRatingScore: 0,
        numRatings: 0,
        views: 0,
        releaseDate: new Date().toISOString(),
        manufacturer: '',
        distributor: ''
      };

      this.homeApplianceService.addHomeAppliance(newHomeAppliance).subscribe({
        next: () => {
          this.router.navigate(['/home-appliances']);
        },
        error: (error: Error) => {
          console.error('Error adding home appliance:', error);
        }
      });
    }
  }
} 