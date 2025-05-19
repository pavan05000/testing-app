import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/services/auth.guard';

const routes: Routes = [
  {
    path:'project_tasks',
    loadComponent: () => import('./tasks/project-tasks/project-tasks.component').then(c => c.ProjectTasksComponent),
    canActivate: [AuthGuard]
  },
  {
    path:'add_task',
    loadComponent: () => import('./tasks/add-task/add-task.component').then(c => c.AddTaskComponent),
    canActivate: [AuthGuard]
  },
  {
    path:'edit_task/:id',
    loadComponent: () => import('./tasks/add-task/add-task.component').then(c => c.AddTaskComponent),
    canActivate: [AuthGuard]
  },
  {
    path:'view_task',
    loadComponent: () => import('./tasks/view-task/view-task.component').then(c => c.ViewTaskComponent),
    canActivate: [AuthGuard]
  },
  {
    path:'project_roles',
    loadComponent: () => import('./project-roles/project-roles.component').then(c => c.ProjectRolesComponent),
    canActivate: [AuthGuard]
  },
  {
    path:'add_project_roles',
    loadComponent: () => import('./project-roles/add-project-roles/add-project-roles.component').then(c => c.AddProjectRolesComponent),
    canActivate: [AuthGuard]
  },
  {
    path:'edit_project_roles/:id',
    loadComponent: () => import('./project-roles/add-project-roles/add-project-roles.component').then(c => c.AddProjectRolesComponent),
    canActivate: [AuthGuard]
  },
  {
    path:'view_project_roles',
    loadComponent: () => import('./project-roles/view-project-roles/view-project-roles.component').then(c => c.ViewProjectRolesComponent),
    // data: { roles: ['Manager'] },  
    canActivate: [AuthGuard]
  }  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterDataRoutingModule { }
