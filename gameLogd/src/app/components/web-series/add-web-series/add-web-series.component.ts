import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { WebSeriesFirebaseService } from '../../../services/webSeriesFirebase.service';
import { WebSeries } from '../../../models/web-series.model';

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
export class AddWebSeriesComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private webSeriesService = inject(WebSeriesFirebaseService);

  webSeriesForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    imageUrl: ['', [Validators.required]],
    price: ['', [Validators.required, Validators.min(0)]],
    creator: ['', [Validators.required]],
    category: ['', [Validators.required]],
    seasons: ['', [Validators.required, Validators.min(1)]],
    episodes: ['', [Validators.required, Validators.min(1)]],
    duration: ['', [Validators.required]],
    platform: ['', [Validators.required]],
    cast: ['', [Validators.required]],
    genre: ['', [Validators.required]],
    releaseYear: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]]
  });

  onSubmit() {
    if (this.webSeriesForm.valid) {
      const newWebSeries: WebSeries = {
        ...this.webSeriesForm.value,
        rating: 0,
        totalRatingScore: 0,
        numRatings: 0,
        views: 0,
        releaseDate: new Date().toISOString(),
        producer: '',
        distributor: ''
      };

      this.webSeriesService.addWebSeries(newWebSeries)
        .then(() => {
          this.router.navigate(['/web-series']);
        })
        .catch(error => {
          console.error('Error adding web series:', error);
        });
    }
  }
} 