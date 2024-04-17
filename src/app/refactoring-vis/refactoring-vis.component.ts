import { AfterViewInit, Component } from '@angular/core';
import { gen_vis } from '@assets/refjs/gen_vis'


@Component({
  selector: 'app-refactoring-vis',
  templateUrl: './refactoring-vis.component.html',
  styleUrl: './refactoring-vis.component.css'
})
export class RefactoringVisComponent implements AfterViewInit {
  ngAfterViewInit(): void {

    gen_vis()


  }
}
