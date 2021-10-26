import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FishWokerComponent } from './fish-woker/fish-woker.component';

const routes: Routes = [
  {
    path: '',
    component: FishWokerComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
