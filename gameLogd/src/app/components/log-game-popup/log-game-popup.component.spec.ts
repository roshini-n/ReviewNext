import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogGamePopupComponent } from './log-game-popup.component';

describe('LogGamePopupComponent', () => {
  let component: LogGamePopupComponent;
  let fixture: ComponentFixture<LogGamePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogGamePopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogGamePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
