import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookSearchListComponent } from './book-search-list.component';

describe('BookSearchListComponent', () => {
  let component: BookSearchListComponent;
  let fixture: ComponentFixture<BookSearchListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookSearchListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookSearchListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
