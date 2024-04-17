import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TestComponent } from './test/test.component';
import { GenerateVisComponent } from './generate-vis/generate-vis.component';
import { RefactoringVisComponent } from './refactoring-vis/refactoring-vis.component';

@NgModule({
  declarations: [
    AppComponent,
    TestComponent,
    GenerateVisComponent,
    RefactoringVisComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
