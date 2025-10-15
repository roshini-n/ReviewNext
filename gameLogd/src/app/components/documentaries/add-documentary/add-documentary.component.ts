import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { DocumentaryFirebaseService } from '../../../services/documentaryFirebase.service';
import { Documentary } from '../../../models/documentary.model';

@Component({
  selector: 'app-add-documentary',
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
  templateUrl: './add-documentary.component.html',
  styleUrls: ['./add-documentary.component.css']
})
export class AddDocumentaryComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private documentaryService = inject(DocumentaryFirebaseService);

  documentaryForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    imageUrl: ['', [Validators.required]],
    price: ['', [Validators.required, Validators.min(0)]],
    director: ['', [Validators.required]],
    category: ['', [Validators.required]],
    duration: ['', [Validators.required]],
    releaseYear: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]],
    language: ['', [Validators.required]],
    subtitles: ['', [Validators.required]],
    topics: ['', [Validators.required]],
    targetAudience: ['', [Validators.required]],
    productionCompany: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.documentaryForm.valid) {
      const newDocumentary: Documentary = {
        ...this.documentaryForm.value,
        rating: 0,
        totalRatingScore: 0,
        numRatings: 0,
        views: 0,
        releaseDate: new Date().toISOString(),
        producer: '',
        distributor: ''
      };

      this.documentaryService.addDocumentary(newDocumentary)
        .then(() => {
          this.router.navigate(['/documentaries']);
        })
        .catch(error => {
          console.error('Error adding documentary:', error);
        });
    }
  }
} 