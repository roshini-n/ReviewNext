import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookReviewEditComponent } from './book-review-edit.component';

describe('BookReviewEditComponent', () => {
  let component: BookReviewEditComponent;
  let fixture: ComponentFixture<BookReviewEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookReviewEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookReviewEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
