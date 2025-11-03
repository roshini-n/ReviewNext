import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebSeriesDetailsComponent } from './webseries-details.component';

describe('WebSeriesDetailsComponent', () => {
  let component: WebSeriesDetailsComponent;
  let fixture: ComponentFixture<WebSeriesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebSeriesDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebSeriesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});