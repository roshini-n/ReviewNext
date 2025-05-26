import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { WebSeriesFirebaseService } from '../../../services/webSeriesFirebase.service';

@Component({
  selector: 'app-add-web-series',
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
  templateUrl: './add-web-series.component.html',
  styleUrls: ['./add-web-series.component.css']
})
export class AddWebSeriesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private webSeriesService = inject(WebSeriesFirebaseService);

  webSeriesForm: FormGroup;
  isSubmitting = false;

  constructor() {
    this.webSeriesForm = this.fb.group({
      title: ['', Validators.required],
      creator: ['', Validators.required],
      description: ['', Validators.required],
      platform: ['', Validators.required],
      imageUrl: ['', Validators.required],
      episodes: [''],
      duration: ['', Validators.required],
      releaseYear: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]]
    });
  }

  ngOnInit(): void {
    // Additional initialization logic if needed
  }

  onSubmit(): void {
    if (this.webSeriesForm.valid) {
      const webSeriesData = this.webSeriesForm.value;
      this.webSeriesService.addWebSeries(webSeriesData)
        .then(() => {
          this.router.navigate(['/web-series']);
        })
        .catch((error: Error) => {
          console.error('Error adding web series:', error);
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/web-series']);
  }
} 