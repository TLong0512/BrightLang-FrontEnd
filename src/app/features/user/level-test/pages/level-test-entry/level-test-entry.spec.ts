import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelTestEntry } from './level-test-entry';

describe('LevelTestEntry', () => {
  let component: LevelTestEntry;
  let fixture: ComponentFixture<LevelTestEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LevelTestEntry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LevelTestEntry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
