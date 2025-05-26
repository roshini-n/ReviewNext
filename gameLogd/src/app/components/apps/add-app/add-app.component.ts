import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { AppFirebaseService } from '../../../services/appFirebase.service';
import { App } from '../../../models/app.model';

@Component({
  selector: 'app-add-app',
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
  templateUrl: './add-app.component.html',
  styleUrls: ['./add-app.component.css']
})
export class AddAppComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private appService = inject(AppFirebaseService);

  appForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    imageUrl: ['', [Validators.required]],
    price: ['', [Validators.required, Validators.min(0)]],
    developer: ['', [Validators.required]],
    category: ['', [Validators.required]],
    version: ['', [Validators.required]],
    size: ['', [Validators.required]],
    platform: ['', [Validators.required]],
    requirements: ['', [Validators.required]],
    features: ['', [Validators.required]],
    releaseNotes: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.appForm.valid) {
      const newApp: App = {
        ...this.appForm.value,
        rating: 0,
        totalRatingScore: 0,
        numRatings: 0,
        downloads: 0,
        releaseDate: new Date().toISOString(),
        publisher: '',
        distributor: ''
      };

      this.appService.addApp(newApp)
        .then(() => {
          this.router.navigate(['/apps']);
        })
        .catch(error => {
          console.error('Error adding app:', error);
        });
    }
  }
} 