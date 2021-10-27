import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentComponent } from './document/document.component';
import { FishWokerComponent } from './fish-woker/fish-woker.component';

const routes: Routes = [
  {
    path: '',
    component: FishWokerComponent,
  },
  {
    path: 'document',
    component: DocumentComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
