import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefactoringPipelineComponent } from './refactoring-pipeline.component';

describe('RefactoringPipelineComponent', () => {
  let component: RefactoringPipelineComponent;
  let fixture: ComponentFixture<RefactoringPipelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RefactoringPipelineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RefactoringPipelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
