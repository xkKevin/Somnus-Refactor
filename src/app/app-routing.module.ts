import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RefactoringVisComponent } from './refactoring-vis/refactoring-vis.component';
import { GenerateVisComponent } from './generate-vis/generate-vis.component';
import { RefactoringPipelineComponent } from './refactoring-pipeline/refactoring-pipeline.component';

const routes: Routes = [
  {
    path: '',
    component: RefactoringPipelineComponent
  },
  {
    path: 'refactory-old',
    component: RefactoringVisComponent
  },
  {
    path: 'somnus',
    component: GenerateVisComponent
  },
  {
    path: '*',
    component: RefactoringPipelineComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
