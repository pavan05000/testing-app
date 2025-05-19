import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ActivatedRouterService } from 'src/app/services/activated-router-service';
import { PMOService} from 'src/app/services/pmo.service';
import { MasterDataService} from 'src/app/services/master-data.service';
import { EmployeeGridComponent} from '../report/employee-grid/employee-grid.component';
import { ProjectGridComponent} from '../report/project-grid/project-grid.component';
import { ManagerService} from 'src/app/services/manager.service';

@Component({
  selector: 'app-report',
  standalone:true,
   imports: [ReactiveFormsModule, ToastModule, CommonModule, DropdownModule, ButtonModule,
          InputTextModule, TableModule, FormsModule, IconFieldModule,MultiSelectModule,ProjectGridComponent,EmployeeGridComponent],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  providers:[MessageService]
})
export class ReportComponent implements OnInit{
  projectReportForm!:FormGroup;
  projectType:any[]=[
    { name:"Project Summary"},
    { name:"Project Detailed"},
     {name:"Employee Summary"},
     { name:"Employee Detailed"}
  ];
projects:any[]=[];
employeeDetails:any[]=[];
isProjectCode:boolean=false;
isEmployeeCode:boolean=false;
projectDetailReport:any[]=[];
projectSummaryReport:any[]=[];
employeeDetailReport:any[]=[];
employeeSummaryReport:any[]=[];
  constructor(private formBuilder: FormBuilder,private pmoService:PMOService,private masterDataService:MasterDataService,
    private activatedRouterService: ActivatedRouterService,private messageService:MessageService,private managerService:ManagerService){}

  ngOnInit(): void {
  this.buildForm();
  this.getProjects();
  this.getEmployees();
}

 buildForm(){
      this.projectReportForm = this.formBuilder.group({
        report_type: new FormControl('', [Validators.required]),
        project_code: new FormControl(''),
        employee_code: new FormControl(null),
    });
  }

  getProjects(){
    this.pmoService.getProjects().subscribe(res=>{
     this.projects=res['data'];
     this.projects = this.projects.map((project:any) => ({
      ...project,
      formattedLabel: `${project.project_code} - ${project.project_description}`  // Concatenating code & name
    }));
    this.projects.sort((a:any, b:any) => a.project_description.localeCompare(b.project_description));
   },(err: any) => { 
     this.activatedRouterService.updateError(err, this.messageService)
   });
 }

 getEmployees(){
  this.masterDataService.getEmployeeDetails().subscribe(res=>{
    this.employeeDetails=res['data'].map((emp: { employee_code: any; name: any; }) => ({
      ...emp,
      employee_codewithName: `${emp.employee_code} - ${emp.name}`
    }));
  },(err: any) => { 
    this.activatedRouterService.updateError(err, this.messageService)
  })
 }

 onChangeReportType(){
  if(this.projectReportForm.controls['report_type']?.value =='Project Summary' || this.projectReportForm.controls['report_type']?.value =='Project Detailed'){
    this.isProjectCode=true;
    this.projectReportForm.controls['employee_code'].clearValidators();
    this.projectReportForm.controls['project_code'].setValidators([Validators.required]);
    this.isEmployeeCode=false;
    this.projectReportForm.controls['project_code']?.setValue('');
    this.projectReportForm.controls['employee_code']?.setValue('');
  }
  else{
    this.isProjectCode=false;
    this.isEmployeeCode=true;
    this.projectReportForm.controls['project_code'].clearValidators();
    // this.projectReportForm.controls['employee_code'].setValidators([Validators.required]);
    this.projectReportForm.controls['employee_code'].clearValidators();
    this.projectReportForm.controls['employee_code']?.setValue('');
    this.projectReportForm.controls['project_code']?.setValue('');
  }
 }

  onSubmit(){
    if(this.projectReportForm.controls['project_code']?.value){
      let apiRequest = {
        "project_code": this.projectReportForm.controls['project_code']?.value
      };
      this.projectSummaryReport=[];
      this.projectDetailReport=[];
      if(this.projectReportForm.controls['report_type']?.value =='Project Summary'){
          this.getProjectSummaryReport(apiRequest);
      } else if(this.projectReportForm.controls['report_type']?.value =='Project Detailed'){
        this.getProjectDetailReport(apiRequest);
      } 
    }
    
    if(this.projectReportForm.controls['employee_code']?.value){
      let apiRequest = {
        "employee_code": this.projectReportForm.controls['employee_code']?.value
      };
      this.employeeDetailReport=[];
      this.employeeSummaryReport=[];
      if(this.projectReportForm.controls['report_type']?.value =='Employee Summary'){
      this.getEmployeeSummaryReport(apiRequest);
      } else if(this.projectReportForm.controls['report_type']?.value =='Employee Detailed'){
        this.getEmployeeDetailReport(apiRequest);
      }
    }
  }

  getFormControl(formControlName:string) {
    return this.projectReportForm.get(formControlName);
  }

  getProjectSummaryReport(project_code:any){
    this.managerService.getProjectSummaryReport(project_code).subscribe(res=>{
      this.projectSummaryReport=res;
    },(err: any) => { 
      this.activatedRouterService.updateError(err, this.messageService)
    });
  }

  getProjectDetailReport(project_code:any){
    this.managerService.getProjectDetailReport(project_code).subscribe(res=>{
      this.processProjectDetailReport(res);
      //this.projectDetailReport=res;
    },(err: any) => { 
      this.activatedRouterService.updateError(err, this.messageService)
    });
  }

  getEmployeeSummaryReport(apiRequest:any){
    this.managerService.getEmployeeSummaryReport(apiRequest).subscribe(res=>{
      this.employeeSummaryReport=res;
    },(err: any) => { 
      this.activatedRouterService.updateError(err, this.messageService)
    });
  }

  getEmployeeDetailReport(apiRequest:any){
    this.managerService.getEmployeeDetailReport(apiRequest).subscribe(res=>{
      //this.employeeDetailReport=res;
      this.processEmployeeDetailReport(res);
    },(err: any) => { 
      this.activatedRouterService.updateError(err, this.messageService)
    });
  }

  processProjectDetailReport(dataobj: any): void {
    if (dataobj && dataobj.length > 0) {
      let allRows: any[] = [];

  
      dataobj.forEach((data: { task_description: { task_group: any;  allocated_hours:any; worked_hours:any; phase_wise_utilization:any }[]; project_region: any; project_country: any; project_code: any; description: any; project_type: any; delivery_model: any; start_date: any; end_date: any; project_status: any; total_allocated_hours: any; total_worked_hours: any; billable_hours: any; non_billable_hours: any; utilization_percentage: any; }) => {
        if (data.task_description.length > 0) {
          let mappedRows = data.task_description.map((task: { task_group: any; allocated_hours:any; worked_hours:any; phase_wise_utilization:any}) => {
            return {
              project_region: data.project_region,
              project_country: data.project_country,
              project_code: data.project_code,
              description: data.description,
              project_type: data.project_type,
              delivery_model: data.delivery_model,
              start_date: data.start_date,
              end_date: data.end_date,
              project_status: data.project_status,
              task: task.task_group,
              // task: task.description,
              // total_allocated_hours: data.total_allocated_hours,
              // total_worked_hours: data.total_worked_hours,
              // billable_hours: data.billable_hours,
              total_allocated_hours: task.allocated_hours,
              total_worked_hours: task.worked_hours,
              billable_hours: task.worked_hours,
              non_billable_hours: data.non_billable_hours,
              utilization_percentage: task.phase_wise_utilization
              // utilization_percentage: data.utilization_percentage
            };
          });
          allRows = allRows.concat(mappedRows); 
        } else {
          allRows.push({ 
            project_region: data.project_region,
            project_country: data.project_country,
            project_code: data.project_code,
            description: data.description,
            project_type: data.project_type,
            delivery_model: data.delivery_model,
            start_date: data.start_date,
            end_date: data.end_date,
            project_status: data.project_status,
            task: '',
            total_allocated_hours: data.total_allocated_hours,
            total_worked_hours: data.total_worked_hours,
            billable_hours: data.billable_hours,
            non_billable_hours: data.non_billable_hours,
            utilization_percentage: data.utilization_percentage
          });
        }
      });
  
      this.projectDetailReport = allRows; 
    } else {
      this.projectDetailReport = dataobj;
    }
  }

  processEmployeeDetailReport(dataobj: any[]): void {
    if (dataobj && dataobj.length > 0) {
      let allRows: any[] = []; 
  
      dataobj.forEach((data: {
        employee_name: string,
        country: string,
        project_region: string,
        project_country: string,
        project_code: string,
        description: string,
        project_type: string,
        delivery_model: string,
        start_date: string,
        end_date: string,
        project_status: string,
        task_description: {
          task_code: number,
          task_group: string,
          description: string,
          billable: string,
          allocated_hours: number,
          worked_hours: number,
          phase_wise_utilization: number
        }[],
        total_allocated_hours: number,
        total_worked_hours: number,
        billable_hours: number,
        non_billable_hours: number,
        utilization_percentage: number
      }) => {
        if (data.task_description && data.task_description.length > 0) {
          let mappedRows = data.task_description.map((task: { task_group:string; allocated_hours:number; worked_hours:number; phase_wise_utilization:number }) => {
            return {
              employee_name: data.employee_name,
              country: data.country,
              project_region: data.project_region,
              project_country: data.project_country,
              project_code: data.project_code,
              description: data.description,
              project_type: data.project_type,
              delivery_model: data.delivery_model,
              start_date: data.start_date,
              end_date: data.end_date,
              project_status: data.project_status,
              // task: task.description,
              // total_allocated_hours: data.total_allocated_hours,
              // total_worked_hours: data.total_worked_hours,
              // billable_hours: data.billable_hours,
              task: task.task_group,
              total_allocated_hours: task.allocated_hours,
              total_worked_hours: task.worked_hours,
              billable_hours: task.worked_hours,
              non_billable_hours: data.non_billable_hours,
              utilization_percentage: task.phase_wise_utilization
              // utilization_percentage: data.utilization_percentage
            };
          });
          allRows = allRows.concat(mappedRows);
        } 
        else {
          allRows.push({
            employee_name: data.employee_name,
            country: data.country,
            project_region: data.project_region,
            project_country: data.project_country,
            project_code: data.project_code,
            description: data.description,
            project_type: data.project_type,
            delivery_model: data.delivery_model,
            start_date: data.start_date,
            end_date: data.end_date,
            project_status: data.project_status,
            task_description: '',
            total_allocated_hours: data.total_allocated_hours,
            total_worked_hours: data.total_worked_hours,
            billable_hours: data.billable_hours,
            non_billable_hours: data.non_billable_hours,
            utilization_percentage: data.utilization_percentage
          });
        }
      });
  
      this.employeeDetailReport = allRows; 
    } else {
      this.employeeDetailReport = dataobj; 
  }

}

}
