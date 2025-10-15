import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralDeleteButtonComponent } from './general-delete-button.component';

describe('GeneralDeleteButtonComponent', () => {
  let component: GeneralDeleteButtonComponent;
  let fixture: ComponentFixture<GeneralDeleteButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralDeleteButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralDeleteButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
