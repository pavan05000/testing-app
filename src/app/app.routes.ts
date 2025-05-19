import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { MenubarComponent } from './components/menubar/menubar.component';
import { AccessDeniedComponent} from './components/access-denied/access-denied.component';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo:'login',
        pathMatch: 'full'
    },
    {
        path:'login',
        component: LoginComponent
    }, 
    {
        path:'forgot_password',
        component: ForgotPasswordComponent
    },
    {
        path:'access-denied',
        component: AccessDeniedComponent
    }, 
    {
        path:'',
        component:MenubarComponent,
        data: { breadcrumb: '' },
        children:[
            {
                path:'um',
                loadChildren:() => import('../app/components/user-management/user-management.module').then(m => m.UserManagementModule),
                data: { roles: ['UserAdmin'] }, 
                canActivate: [AuthGuard]
            },
            {
                path:'md',
                loadChildren:() => import('../app/components/master-data/master-data.module').then(m => m.MasterDataModule),
                data: { roles: ['DataAdmin'] }, 
                canActivate: [AuthGuard]
            },
            {
                path:'pmo',
                loadChildren:() => import('../app/components/pmo/pmo.module').then(m => m.PMOModule),
                data: { roles: ['PMO'] }, 
                canActivate: [AuthGuard]
            },
            {
                 path:'emp',
                 loadChildren:() => import('../app/components/employee-timesheet/employee.module').then(m => m.EmployeeModule),
                 data: { roles: ['Manager','Employee','PMO'] }, 
                 canActivate: [AuthGuard]
            },
            {
                path:'manager',
                loadChildren:() => import('../app/components/manager/manager.module').then(m => m.ManagerModule),
                data: { roles: ['Manager'] }, 
                canActivate: [AuthGuard]
            },
            {
                path:'hr',
                loadChildren:() => import('../app/components/hr/hr.module').then(m => m.HrModule),
                data: { roles: ['HR'] }, 
                canActivate: [AuthGuard]
            },
            {
                path:'dh',
                loadChildren:() => import('../app/components/delivery-head/delivery-head.module').then(m => m.DeliveryHeadModule),
                data: { roles: ['DeliveryHead'] }, 
                canActivate: [AuthGuard]
            },
            {
                path:'mgmnt',
                loadChildren:() => import('../app/components/managemnet/managemnet.module').then(m => m.ManagemnetModule),
                data: { roles: ['Management'] }, 
                canActivate: [AuthGuard]
            }
        ]
    }
];
