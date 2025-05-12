import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameLogMenuComponent } from './game-log-menu.component';

describe('GameLogMenuComponent', () => {
  let component: GameLogMenuComponent;
  let fixture: ComponentFixture<GameLogMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameLogMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameLogMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
