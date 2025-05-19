import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ManagerService {
private readonly url=environment.apiUrl; 
  constructor(private http:HttpClient) { }

getTimesheetProjectCode(obj:any):Observable<any>{
    return this.http.post(this.url+'/manager/timesheet/approve/',obj);
  }

timesheetApproval(obj:any){
  return this.http.put(this.url+'/manager/timesheet/approve/reject/', obj);
}

getProjectSummaryReport(req:any):Observable<any>{
  return this.http.post<any[]>(this.url+'manager/project-summary/',req)
}
getProjectDetailReport(req:any):Observable<any>{
  return this.http.post<any[]>(this.url+'manager/project-detailed/',req)
}
getEmployeeSummaryReport(req:any):Observable<any>{
  return this.http.post<any[]>(this.url+'manager/employee-summary/',req)
}
getEmployeeDetailReport(req:any):Observable<any>{
  return this.http.post<any[]>(this.url+'manager/employee-detailed/',req)
}

getPhasesByProjectCode(projectCode:any) {
  return this.http.post(this.url+'manager/get-projecthours-by-proejct/', projectCode)
}
      
}
