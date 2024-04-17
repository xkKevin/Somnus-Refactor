import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefactoringVisComponent } from './refactoring-vis.component';

describe('RefactoringVisComponent', () => {
  let component: RefactoringVisComponent;
  let fixture: ComponentFixture<RefactoringVisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RefactoringVisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RefactoringVisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
