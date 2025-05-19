import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environment';
import { pmo} from '../models/pmo';

@Injectable({
  providedIn: 'root'
})
export class PMOService {
  private readonly url=environment.apiUrl; 

  constructor(private http:HttpClient) { }

   getProjects():Observable<any>{
    return this.http.get(this.url+'pmo/get-projects/')
  }
  createProjectAssignment(pmo:any){ 
  return this.http.post(this.url+'pmo/add-project/', pmo);
  }

  getProjectsById(projectCode:string):Observable<any>{
    return this.http.get(this.url+'pmo/get-project-by-code/'+projectCode+'/');
  }
  updatePMO(projectCode:string,pmo:any){
      return this.http.put(this.url+'pmo/edit-project/'+projectCode+'/',pmo);
    }
  getProjectTeam(projectCode:string):Observable<any>{
    return this.http.get(this.url+'pmo/display-project-team?project_code='+projectCode)
  }
  addProjectTeam(projectTeam:any){ 
    return this.http.post(this.url+'pmo/add-project-team/', projectTeam);
    }
  updateProjectTeam(projectTeam:any,projectCode:string){
    return this.http.put(this.url+'pmo/edit-project-team/',projectTeam);
  }
  deleteProjectTeam(projectCode: string): Observable<any> {
      return this.http.delete(this.url + 'pmo/delete-project-team/'+projectCode+'/');
    }

  addPhase(payload:any){ 
    return this.http.post(this.url+'pmo/phase-allocation-create-bulk', payload);
    // return this.http.post(this.url+'pmo/phase-allocation/', payload);
  }

  getPhases() {
    return this.http.get(this.url+'pmo/phase-allocation')
  }

  getPhasesByProject(projectCode:any) {
    return this.http.get(this.url+'pmo/pmo/phase-allocation/by-project/?project_code='+projectCode)
  }

  updatePhase(payload:any){ 
    return this.http.put(this.url+'pmo/phase-allocation/update-bulk/', payload);
    // return this.http.put(this.url+'pmo/phase-allocation/update/', payload);
  }

  createAndUpdatePhase(payload:any){ 
    return this.http.post(this.url+'pmo/phase-allocation/update/', payload);
  }

  deletePhase(phaseId: any): Observable<any> {
    return this.http.delete(this.url + 'pmo/phase-allocation/delete/'+phaseId+'/');
  }

  getPMOReport(payload:any){ 
    return this.http.post(this.url+'pmo/pmo-report/', payload);
  }

}
