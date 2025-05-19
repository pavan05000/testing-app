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
import { ManagerService} from 'src/app/services/manager.service';
import { HrEmpReportComponent } from './hr-emp-report/hr-emp-report.component';
import { LoginService } from 'src/app/services/login.service';

@Component({
  standalone: true,
  selector: 'app-hr-reports',
  templateUrl: './hr-reports.component.html',
  styleUrls: ['./hr-reports.component.css'],
  imports: [ReactiveFormsModule, ToastModule, CommonModule, DropdownModule, ButtonModule,
            InputTextModule, TableModule, FormsModule, IconFieldModule,MultiSelectModule, HrEmpReportComponent],
    providers:[MessageService]
})
export class HrReportsComponent implements OnInit {

  employeeReportForm!:FormGroup;
  projectType:any[]=[
     {name:"Employee Summary"},
     {name:"Employee Summary - Project Wise"},
     { name:"Employee Detailed"}
  ];
projects:any[]=[];
employeeDetails:any[]=[];
isEmployeeCode:boolean=false;
employeeDetailReport:any[]=[];
employeeSummaryReport:any[]=[];
employeeSummaryProjectWiseReport:any[]=[];
reportType:string = '';

months = [ 
  { id: 1, name: "JANUARY" },
  { id: 2, name: "FEBRUARY" },
  { id: 3, name: "MARCH" },
  { id: 4, name: "APRIL" },
  { id: 5, name: "MAY" },
  { id: 6, name: "JUNE" },
  { id: 7, name: "JULY" },
  { id: 8, name: "AUGUST" },
  { id: 9, name: "SEPTEMBER" },
  { id: 10, name: "OCTOBER" },
  { id: 11, name: "NOVEMBER" },
  { id: 12, name: "DECEMBER" },
];
years: number[] = [];
countryList: any = [];
roles:any = [];
userId:string = '';
employeeDropdownDisabled:boolean = false;

  
constructor(
  private formBuilder: FormBuilder,
  private pmoService:PMOService,
  private masterDataService:MasterDataService,
  private activatedRouterService: ActivatedRouterService,
  private messageService:MessageService,
  private managerService:ManagerService,
  private loginService:LoginService
  ){}

  ngOnInit(): void {
    this.roles = localStorage.getItem('Roles') || '';
    this.roles = this.roles.split(',');
    this.userId = localStorage.getItem('userId') || '';

    this.buildForm();
    this.generateYearArray();
    this.getEmployees();
    this.getDropdownData();
    
    const today = new Date();
    this.employeeReportForm.controls['month'].setValue(today.getMonth() + 1); 
    this.employeeReportForm.controls['year'].setValue(today.getFullYear());
  }

 buildForm(){
      this.employeeReportForm = this.formBuilder.group({
        report_type: new FormControl('', [Validators.required]),
        employee_code: new FormControl(null),
        country: new FormControl(null),
        month: new FormControl(''),
        year: new FormControl(null),
    });
  }

 getEmployees(){
  this.masterDataService.getEmployeeDetails().subscribe(res=>{
    this.employeeDetails=res['data'].map((emp: { employee_code: any; name: any; }) => ({
      ...emp,
      employee_codewithName: `${emp.employee_code} - ${emp.name}`
    }));

    this.employeeReportForm.controls['employee_code']?.setValue(this.userId);
    if (this.roles.includes('Employee') && this.roles.length === 1) {     
      this.employeeDropdownDisabled = true;
    } else {
      this.employeeDropdownDisabled = false;
    }
  },(err: any) => { 
    this.activatedRouterService.updateError(err, this.messageService)
  })
 }

 onChangeReportType(event:any){
    this.isEmployeeCode=true;
    this.reportType = event.target.value;
    // this.employeeReportForm.controls['employee_code'].setValidators([Validators.required]);
    // this.employeeReportForm.controls['employee_code']?.setValue('');
 }

 generateYearArray() {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 1;
  const endYear = currentYear + 6;
  for (let year = startYear; year <= endYear; year++) {
    this.years.push(year);
  }
}

getDropdownData(){
  this.loginService.getDropdownData().subscribe(data => {
    this.countryList=data.countryList;
  });
}

  onSubmit(){
    // if(this.employeeReportForm.controls['employee_code']?.value){
      let apiRequest = {
        "employee_code": this.employeeReportForm.controls['employee_code']?.value == null ? "" : this.employeeReportForm.controls['employee_code']?.value,
        "country": this.employeeReportForm.controls['country']?.value == null ? "" : this.employeeReportForm.controls['country']?.value,
        "month": this.employeeReportForm.controls['month']?.value,
        "year": this.employeeReportForm.controls['year']?.value,
      };
      this.employeeDetailReport=[];
      this.employeeSummaryReport=[];
      this.employeeSummaryProjectWiseReport=[];

      if(this.employeeReportForm.controls['report_type']?.value =='Employee Summary'){
      this.getEmployeeSummaryReport(apiRequest);
      }  else if(this.employeeReportForm.controls['report_type']?.value =='Employee Summary - Project Wise'){
        this.getEmployeeSummaryProjectWiseReport(apiRequest);
      } else if(this.employeeReportForm.controls['report_type']?.value =='Employee Detailed'){
          this.getEmployeeDetailReport(apiRequest);
      }

      this.reportType = this.employeeReportForm.controls['report_type']?.value;
    // }
  }

  getFormControl(formControlName:string) {
    return this.employeeReportForm.get(formControlName);
  }

  getEmployeeSummaryReport(apiRequest:any){
    this.masterDataService.getEmployeeSummaryReport(apiRequest).subscribe(res=>{
      this.employeeSummaryReport=res['summary_report'];
    },(err: any) => { 
      this.activatedRouterService.updateError(err, this.messageService)
    });
  }

  getEmployeeSummaryProjectWiseReport(apiRequest:any){
    this.masterDataService.getEmployeeSummaryProjectWiseReport(apiRequest).subscribe(res=>{
      this.employeeSummaryProjectWiseReport=res['detailed_report_project'];
    },(err: any) => { 
      this.activatedRouterService.updateError(err, this.messageService)
    });
  }

  getEmployeeDetailReport(apiRequest:any){
    this.masterDataService.getEmployeeDetailReport(apiRequest).subscribe(res=>{
      this.employeeDetailReport=res['detailed_report'];
    },(err: any) => { 
      this.activatedRouterService.updateError(err, this.messageService)
    });
  }
}
