import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './add-app.component.html',
  styleUrls: ['./add-app.component.css']
})
export class AddAppComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private appService = inject(AppFirebaseService);

  appForm: FormGroup;
  isSubmitting = false;

  constructor() {
    this.appForm = this.fb.group({
      title: ['', Validators.required],
      developer: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      platform: ['', Validators.required],
      imageUrl: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Additional initialization logic if needed
  }

  onSubmit(): void {
    if (this.appForm.valid) {
      const appData = this.appForm.value;
      this.appService.addApp(appData)
        .then(() => {
          this.router.navigate(['/apps']);
        })
        .catch((error: Error) => {
          console.error('Error adding app:', error);
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/apps']);
  }
} 