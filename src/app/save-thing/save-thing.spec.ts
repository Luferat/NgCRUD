import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveThing } from './save-thing';

describe('SaveThing', () => {
  let component: SaveThing;
  let fixture: ComponentFixture<SaveThing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaveThing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaveThing);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
