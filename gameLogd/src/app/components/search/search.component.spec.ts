import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { SearchComponent } from './search.component';
import { MatCardModule } from '@angular/material/card';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchComponent, MatCardModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ q: 'test query' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get search query from URL parameters', () => {
    expect(component.searchQuery).toBe('test query');
  });

  it('should show no results message when searchResults is empty', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.no-results')).toBeTruthy();
    expect(compiled.querySelector('.no-results')?.textContent).toContain('No results found');
  });
}); 