import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameSearchListComponent } from './game-search-list.component';

describe('GameSearchListComponent', () => {
  let component: GameSearchListComponent;
  let fixture: ComponentFixture<GameSearchListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameSearchListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameSearchListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
