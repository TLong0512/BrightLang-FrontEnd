import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFooterComponent } from './footer';

describe('Footer', () => {
  let component: UserFooterComponent;
  let fixture: ComponentFixture<UserFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
