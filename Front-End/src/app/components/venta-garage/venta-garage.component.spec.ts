import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentaGarageComponent } from './venta-garage.component';

describe('VentaGarageComponent', () => {
  let component: VentaGarageComponent;
  let fixture: ComponentFixture<VentaGarageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentaGarageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VentaGarageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
