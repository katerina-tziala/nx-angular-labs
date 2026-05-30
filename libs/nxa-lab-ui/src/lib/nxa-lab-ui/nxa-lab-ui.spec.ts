import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { NxaLabUi } from './nxa-lab-ui';

describe('NxaLabUi', () => {
  let component: NxaLabUi;
  let fixture: ComponentFixture<NxaLabUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NxaLabUi],
    }).compileComponents();

    fixture = TestBed.createComponent(NxaLabUi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
