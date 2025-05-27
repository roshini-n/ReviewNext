import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CarouselModule } from 'primeng/carousel';
import { DocumentaryFirebaseService } from '../../../services/documentaryFirebase.service';
import { Documentary } from '../../../models/documentary.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-documentary',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    CarouselModule
  ],
  templateUrl: './documentary.component.html',
  styleUrls: ['./documentary.component.css']
})
export class DocumentaryComponent implements OnInit {
  allDocumentaries: Documentary[] = [];
  trendingDocumentaries: Documentary[] = [];
  topRatedDocumentaries: Documentary[] = [];
  popularDocumentaries: Documentary[] = [];
  documentaryFirebaseService = inject(DocumentaryFirebaseService);
  authService = inject(AuthService);

  ngOnInit(): void {
    this.loadDocumentaries();
  }

  loadDocumentaries(): void {
    this.documentaryFirebaseService.getDocumentaries().subscribe((documentaries: Documentary[]) => {
      this.allDocumentaries = documentaries;
      this.trendingDocumentaries = documentaries;
      this.topRatedDocumentaries = documentaries.filter(doc => doc.rating >= 3.5);
      this.popularDocumentaries = documentaries;
    });
  }
} 