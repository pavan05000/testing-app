import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environment';
import { Tasks} from '../models/tasks';
import { Employee} from '../models/employee';

@Injectable({
  providedIn: 'root'
})
export class MasterDataService {

 private readonly url=environment.apiUrl; 
   private token = localStorage.getItem('access_token'); 
 
  //  private headers = new HttpHeaders({
  //    'Authorization': `Bearer ${this.token}`
  //  });
 
   constructor(private http:HttpClient) { }
 
  //  getTasks():Observable<any>{
  //   const headers=this.headers;
  //   return this.http.get(this.url+'master_data/display-task/',{ headers })
  // }
    getTasks():Observable<any>{
     return this.http.get(this.url+'master_data/display-task/');
   }
   getTasksById(task_code:number):Observable<any>{
    return this.http.get(this.url+'master_data/display-task-byid/'+task_code+'/');
  }
 
   addTask(task:any){ 
     return this.http.post(this.url+'master_data/add-task/', task);
   }

   updateTask(task_code:number,task:Tasks){
       return this.http.put(this.url+'master_data/edit-task/'+task_code+'/',task);
     }

     deleteTask(task_code: number): Observable<any> {
        return this.http.delete(this.url + 'master_data/delete-task/'+task_code+'/');
      }
  
   //Employee
   getEmployeeDetails():Observable<any>{
    return this.http.get(this.url+'master_data/display-employee/')
  }

  getEmployeeById(employee_code:string):Observable<any>{
    return this.http.get(this.url+'master_data/display-employee-byid/'+employee_code+'/');
  }
  
  addEmployee(employee:any){
      return this.http.post(this.url+'master_data/add-employee/',employee);
    }

  updateEmployee(employee_code:string,employee:Employee){
      return this.http.put(this.url+'master_data/edit-employee/'+employee_code+'/',employee);
    }
  
    getProjectRoles():Observable<any>{
      return this.http.get(this.url+'master_data/display-projectroles/')
    }
    getProjectRolesById(id:number):Observable<any>{
      return this.http.get(this.url+'master_data/display-projectrole-byid/'+id+'/');
    }
    addProjectRoles(projectRoles:any){
        return this.http.post(this.url+'master_data/add-projectroles/',projectRoles);
      }

    updateProjectRoles(projectRoleId:number,projectRoles:any){
        return this.http.put(this.url+'master_data/edit-projectroles/'+projectRoleId+'/',projectRoles);
      }

    getPhasesWithDescription(project_code:string):Observable<any>{
      return this.http.get(this.url+'master_data/task-descriptions-by-phase-projectcode/?project_code='+project_code);
      // return this.http.get(this.url+'master_data/task-descriptions-by-phase/');
    }

    getEmployeeSummaryReport(req:any):Observable<any>{
      return this.http.post<any[]>(this.url+'master_data/get-employee-summary-report',req)
    }
    getEmployeeSummaryProjectWiseReport(req:any):Observable<any>{
      return this.http.post<any[]>(this.url+'master_data/get-employee-summary-report-detailed-byproject',req)
    }
    getEmployeeDetailReport(req:any):Observable<any>{
      return this.http.post<any[]>(this.url+'master_data/get-employee-summary-report-detailed',req)
    }

    getDashboardResponse(year:any, employee_code:string):Observable<any>{
      return this.http.get(this.url+'/master_data/employee-dashboard/'+year+'/'+employee_code+'/');
    }
}
