import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosAcademicosComponent } from './productos-academicos.component';

describe('ProductosAcademicosComponent', () => {
  let component: ProductosAcademicosComponent;
  let fixture: ComponentFixture<ProductosAcademicosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosAcademicosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductosAcademicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
