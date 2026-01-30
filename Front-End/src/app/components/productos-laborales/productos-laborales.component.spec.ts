import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosLaboralesComponent } from './productos-laborales.component';

describe('ProductosLaboralesComponent', () => {
  let component: ProductosLaboralesComponent;
  let fixture: ComponentFixture<ProductosLaboralesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosLaboralesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductosLaboralesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
