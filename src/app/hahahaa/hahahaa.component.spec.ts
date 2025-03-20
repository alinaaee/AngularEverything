import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HahahaaComponent } from './hahahaa.component';

describe('HahahaaComponent', () => {
  let component: HahahaaComponent;
  let fixture: ComponentFixture<HahahaaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HahahaaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HahahaaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
