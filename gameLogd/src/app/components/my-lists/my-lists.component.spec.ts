import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyListsComponent } from './my-lists.component';

describe('MyListsComponent', () => {
  let component: MyListsComponent;
  let fixture: ComponentFixture<MyListsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyListsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
