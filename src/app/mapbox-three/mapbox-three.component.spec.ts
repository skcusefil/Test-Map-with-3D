import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapboxThreeComponent } from './mapbox-three.component';

describe('MapboxThreeComponent', () => {
  let component: MapboxThreeComponent;
  let fixture: ComponentFixture<MapboxThreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapboxThreeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapboxThreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
