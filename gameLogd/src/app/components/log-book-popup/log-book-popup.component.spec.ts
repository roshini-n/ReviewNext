import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogBookPopupComponent } from './log-book-popup.component';

describe('LogBookPopupComponent', () => {
  let component: LogBookPopupComponent;
  let fixture: ComponentFixture<LogBookPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogBookPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogBookPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
