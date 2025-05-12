import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MylogComponent } from './mylog.component';

describe('MylogComponent', () => {
  let component: MylogComponent;
  let fixture: ComponentFixture<MylogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MylogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MylogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
