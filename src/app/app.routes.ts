import { Routes } from '@angular/router';
import { PlannerPageComponent } from './features/weekly-planner/pages/planner-page/planner-page.component';

export const routes: Routes = [
  {
    path: '',
    component: PlannerPageComponent,
    title: 'Cadence — Weekly Work List'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
