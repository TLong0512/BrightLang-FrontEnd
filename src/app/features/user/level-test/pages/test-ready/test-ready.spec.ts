import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestReady } from './test-ready';

describe('TestReady', () => {
  let component: TestReady;
  let fixture: ComponentFixture<TestReady>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestReady]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestReady);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
