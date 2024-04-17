import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RefactoringVisComponent } from './refactoring-vis/refactoring-vis.component';
import { GenerateVisComponent } from './generate-vis/generate-vis.component';

const routes: Routes = [
  {
    path: '',
    component: RefactoringVisComponent
  },
  {
    path: 'somnus',
    component: GenerateVisComponent
  },
  {
    path: '*',
    component: RefactoringVisComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
