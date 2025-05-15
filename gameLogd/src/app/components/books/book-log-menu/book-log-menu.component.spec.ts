import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookLogMenuComponent } from './book-log-menu.component';

describe('BookLogMenuComponent', () => {
  let component: BookLogMenuComponent;
  let fixture: ComponentFixture<BookLogMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookLogMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookLogMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
