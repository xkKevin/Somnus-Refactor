import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateVisComponent } from './generate-vis.component';

describe('GenerateVisComponent', () => {
  let component: GenerateVisComponent;
  let fixture: ComponentFixture<GenerateVisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GenerateVisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GenerateVisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
