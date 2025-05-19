import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormBuilder,FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { Table, TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { MasterDataService} from '../../../services/master-data.service';
import { ActivatedRouterService } from '../../../services/activated-router-service';
import { PMOService} from '../../../services/pmo.service';
import { ProjectTeam} from '../../../models/project-team';
import { NumbersOnlyDirective } from 'src/app/directives/numbers-only.directive';
import { DisableKeysDirective } from 'src/app/directives/disable-keys.directive';
@Component({
  selector: 'app-project-team',
  imports: [ReactiveFormsModule, ToastModule, CalendarModule, CommonModule, DropdownModule,
    TableModule, CommonModule, InputIconModule, IconFieldModule, ToastModule, DialogModule,
            ConfirmDialogModule, CheckboxModule, FormsModule, ReactiveFormsModule, NumbersOnlyDirective,
          DisableKeysDirective],
  templateUrl: './project-team.component.html',
  styleUrls: ['./project-team.component.scss'],
  providers: [ConfirmationService, MessageService],
  standalone:true
})
export class ProjectTeamComponent implements OnInit{
  @ViewChild('dt2') dt : Table | undefined
  @Input() employeeDetails:any[]=[];
  @Input() projectCode:string='';
  @Input() projectsData:any;
  @Output() allocatedHoursChanged = new EventEmitter<number>(); 
  @Output() updateProjectAssignmentEvent = new EventEmitter(); 
  @Output() submitButtonHide = new EventEmitter<boolean>(); 
  projectTeam:any[]=[];
  projectRoles:any[]=[];
  displayDeleteDialog:boolean=false;
  selectedProjectRow:any;
  rowIndex:number=0;
  tasks:any[]=[];
  projectTeamModel:ProjectTeam[]=[];
  editRows: boolean[] = [];
  // minDate: string='';
  // maxDate:string='';
  // minEndDate:string='';
  // isStartDateValue:boolean=false;
  projectAllocatedHours:number = 0;
  totalprojectAllocatedHours:number=0;
  projectStartDate:any;
  projectEndDate:any;
  constructor(private masterDataService:MasterDataService,private activatedRouterService:ActivatedRouterService,
     private messageService:MessageService,private pmoService:PMOService,private router:Router){}
  ngOnInit(): void {
    if(this.projectCode){
      this.getProjectTeam();
    }
    this.getProjectRoles();
    // this.getTasks();
    this.getPhases();

    this.employeeDetails = this.employeeDetails.map(emp => ({
      ...emp,
      formattedLabel: `${emp.employee_code} - ${emp.name}`  // Concatenating code & name
    }));
  }

  getProjectRoles(){
    this.masterDataService.getProjectRoles().subscribe(res=>{
      this.projectRoles=res['data'];
    });
  }

  getProjectTeam(){    
    this.projectTeam=[];
    this.pmoService.getProjectTeam(this.projectCode).subscribe(res=>{
      this.projectTeam=res;
      this.projectTeam = this.projectTeam.map(member => {
        return {
          ...member,
          start_date: new Date(member.start_date),
          end_date: new Date(member.end_date)
        };
      });
      this.projectAllocatedHours = this.projectsData?.budgeted_hours; 
      this.editRows = this.projectTeam.map(project => !project.id);
      this.projectStartDate = new Date(this.projectsData?.from_date);
      this.projectEndDate = new Date(this.projectsData?.to_date);
    });
  }
  // getTasks(){
  //   this.masterDataService.getTasks().subscribe(res=>{
  //    this.tasks=res['data'];
  //   })
  // }

  getPhases() {
    this.pmoService.getPhasesByProject(this.projectCode).subscribe((res:any)=> {
      this.tasks=res;
      // this.tasks =this.tasks.map((task:any) => {
      //   if(task.phase_name == "Organization Standard Tasks"  && task.project_code == "RBXint0001") {
      //     return {
      //       ...task,
      //       task: 59 //changing 70 to 59
      //     }
      //   } else {
      //     return {
      //       ...task
      //     }
      //   }
      // })
      // console.log("this.tasks:::", this.tasks);
    })
  }

  // addProjectTeam(){
  //   // this.setMinandMaxDate();
  //   const newRow = {
  //     project_code:'',
  //     employee_code: '',
  //     employee_name: '',
  //     designation: '',
  //     project_role: '',
  //     start_date: '',
  //     end_date: '',
  //     // start_date: this.minDate,
  //     // end_date: this.maxDate,
  //     task: '',
  //     allocated_hours: '',
  //     isEdit:false,
  //   };
  //   this.projectTeam.push(newRow);
  //   this.submitButtonHide.emit(true);
  // }

  addProjectTeam() {
    const newRow = {
      project_code: '',
      employee_code: '',
      employee_name: '',
      designation: '',
      project_role: '',
      start_date: '',
      end_date: '',
      task: '',
      allocated_hours: '',
      isEdit: false,
    };
  
    // Push and reassign to trigger change detection
    this.projectTeam = [...this.projectTeam, newRow];
  
    this.submitButtonHide.emit(true);
  
    // Wait for table to render, then update paginator
    setTimeout(() => {
      if (this.dt) {
        const totalRecords = this.projectTeam.length;
        const rowsPerPage = this.dt.rows || 10;
        const lastPage = Math.floor((totalRecords - 1) / rowsPerPage);
        this.dt.first = lastPage * rowsPerPage;
      }
    });
  }  

  isSubmitDisabled(): boolean {
    return this.projectTeam.some(team => 
      !team.employee_code || 
      !team.employee_name || 
      !team.designation || 
      !team.project_role || 
      !team.start_date || 
      !team.end_date || 
      !team.task || 
      !team.allocated_hours
    );
  }

  navigateToGrid() {
    this.router.navigate(['/pmo/project-assignment']);
  }

  changeFormat(dateToTransfer:string){
    const date = new Date(dateToTransfer);
    const formattedDate = date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0');
    return formattedDate
  }

  displayChangedFormat(dateToTransfer:string){
    const date = new Date(dateToTransfer);
    const formattedDate =       
      String(date.getDate()).padStart(2, '0') + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      date.getFullYear();

    return formattedDate
  }

  onSubmitProjectTeam() {
  
    if (this.totalprojectAllocatedHours > this.projectAllocatedHours) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Total allocated hours exceed project limit.',
      });
      return; // Stop further execution if the limit is exceeded
    }

    console.log(this.projectTeam);
    this.projectTeam = this.projectTeam.map(element => ({
      ...element,
      project_code: this.projectCode,
      task: +element.task,
      project_role: +element.project_role,
      start_date: this.changeFormat(element.start_date),
      end_date: this.changeFormat(element.end_date)
    }));
  
    const newRecords = this.projectTeam.filter(element => !element.id);
    const existingRecords = this.projectTeam.filter(element => element.id && element.isEdit==true);
    let count=0;
    if (newRecords.length > 0) {
      console.log("newRecords::", newRecords);
      this.pmoService.addProjectTeam(newRecords).subscribe(
            data=>{
              this.getProjectTeam();
              this.updateProjectAssignmentEvent.emit();
              count=count+1;
            this.messageService.add({ severity: 'success', summary: '', detail: 'Project Team Created Successfully' });
            setTimeout(() => {
            }, 1000);
          },(err: any) => {
            console.log(err, err?.error?.error);
            const errMsg = err?.error?.errors?.[0]?.error || err?.error?.[0]?.non_field_errors?.[0] || err?.error?.error  || err?.error?.errors?.[0]?.error;
            this.messageService.add({ severity: 'error', summary: '', detail: errMsg });
            setTimeout(() => {
              const currentRoute = this.router.url;
              this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this.router.navigateByUrl(currentRoute);
              });
            }, 2500) 
          });
    }
    if (existingRecords.length > 0) {
      // Remove 'isEdit' and 'id' properties
      const payload = existingRecords.map(({isEdit, ...rest }) => rest);
      this.pmoService.updateProjectTeam(payload,this.projectCode).subscribe(
        data=>{
          this.getProjectTeam();
            if(count==0)
            {
            this.updateProjectAssignmentEvent.emit();
            }
        this.messageService.add({ severity: 'success', summary: '', detail: 'Project Team Update Successfully' });
        setTimeout(() => {
        }, 1000);
      },(err: any) => {
        console.log(err); 
        // this.activatedRouterService.updateError(err, this.messageService);
        const errMsg = err?.error?.error || err?.error?.errors?.[0]?.non_field_errors?.[0] || err?.error?.errors?.non_field_errors || err?.error?.errors?.[0]?.error
        this.messageService.add({ severity: 'error', summary: '', detail: errMsg });
        setTimeout(() => {
          const currentRoute = this.router.url;
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigateByUrl(currentRoute);
          });
        }, 2500)
      });
    }
  this.submitButtonHide.emit(false);    
  }

  onChangeEmployee(employee_code: string, rowIndex: number) {
    const selectedEmployeeData = this.employeeDetails.find((employee: any) => employee.employee_code === employee_code);
    if (selectedEmployeeData) {
      this.projectTeam[rowIndex].employee_name = selectedEmployeeData.name;
      this.projectTeam[rowIndex].designation = selectedEmployeeData.designation;
    }

    const selectedPhase = this.projectTeam[rowIndex].task;
    // Check if the employee is already added with the same phase
    const duplicateEntry = this.projectTeam.some((item, index) =>
      index !== rowIndex && item.employee_code === employee_code && item.task === Number(selectedPhase)
    );

    if (duplicateEntry) {
      this.messageService.add({ severity: 'error', summary: '', detail: 'This employee is already assigned with the selected phase.' });
      this.projectTeam.splice(rowIndex, 1);
      return;
    }

    // const countOfEmployeeCode = this.projectTeam.filter(item => item.employee_code === employee_code).length;
    // const employeeCodeExists = this.projectTeam?.some(item => item.employee_code === employee_code);
    // if (countOfEmployeeCode > 1) {
    //   this.messageService.add({ severity: 'error', summary: '', detail: 'This employee has already been added to the project team.' });
    //   this.projectTeam.splice(rowIndex, 1);
    //   return;
    // }
  }

  showDeleteDialog(project:any,rowIndex:number){
    this.displayDeleteDialog = true;
    this.selectedProjectRow=project;
    this.rowIndex=rowIndex;
  }
  closeDeleteDialog() {
    this.displayDeleteDialog = false;
    this.selectedProjectRow=null;
    this.rowIndex=0;
  }
//   deleteProjectTeam(){
//     this.updateProjectAllocatedHours(this.selectedProjectRow.allocated_hours);
//     if(this.selectedProjectRow?.id){
//      this.pmoService.deleteProjectTeam(this.selectedProjectRow.id).subscribe(data=>{
//       this.messageService.add({ severity: 'success', summary: '', detail: ' Deleted Successfully' });
//       this.projectTeam.splice(this.rowIndex,1);
//       setTimeout(() => {
//         this.updateProjectAssignmentEvent.emit();
//       }, 500);
//      },(err: any) => { 
//      this.activatedRouterService.updateError(err, this.messageService)
//    });
//  }
//     else{
//       this.projectTeam.splice(this.rowIndex,1);
//     }
//     this.displayDeleteDialog = false;
//     //this.updateProjectAllocatedHours(this.selectedProjectRow.allocated_hours);
//   }

deleteProjectTeam() {
  this.updateProjectAllocatedHours(this.selectedProjectRow.allocated_hours);

  const isServerRecord = this.selectedProjectRow?.id;
  const indexToDelete = this.rowIndex;

  const removeFromList = () => {
    if (indexToDelete >= 0 && indexToDelete < this.projectTeam.length) {
      this.projectTeam.splice(indexToDelete, 1);
      this.projectTeam = [...this.projectTeam]; // trigger UI update

      // Adjust paginator
      setTimeout(() => {
        if (this.dt) {
          const totalRecords = this.projectTeam.length;
          const rowsPerPage = this.dt.rows || 10;
          const currentPage = Math.floor(this.dt.first! / rowsPerPage);
          const lastPage = Math.floor((totalRecords - 1) / rowsPerPage);
          
          if (currentPage > lastPage) {
            this.dt.first = lastPage * rowsPerPage;
          }
        }
      });
    }
  };

  if (isServerRecord) {
    this.pmoService.deleteProjectTeam(this.selectedProjectRow.id).subscribe(
      data => {
        this.messageService.add({ severity: 'success', summary: '', detail: 'Deleted Successfully' });
        removeFromList();
        setTimeout(() => {
          this.updateProjectAssignmentEvent.emit();
        }, 500);
      },
      err => {
        this.activatedRouterService.updateError(err, this.messageService);
      }
    );
  } else {
    removeFromList();
  }

  this.displayDeleteDialog = false;
}

applyFilterGlobal($event:any, stringVal:any) {
  this.dt!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
}


  // edit(project:any,rowIndex:number){
  //   this.editRows[rowIndex] = true;
  //   this.projectTeam[rowIndex].isEdit=true;
  //   this.submitButtonHide.emit(true);
  // }

  edit(project: any) {
    // console.log("project:::::::", project);
    // const index = this.projectTeam.findIndex(p => p.id === project.id);
    // console.log("index::::", index);
    // console.log("this.editRows::::", this.editRows);
    // console.log("this.projectTeam::::", this.projectTeam);
    // if (index !== -1) {
    //   this.editRows[index] = true;
    //   this.projectTeam[index].isEdit = true;
    //   this.submitButtonHide.emit(true);
    // }

    project.isEdit = true;
    this.submitButtonHide.emit(true);
  }  

  // setMinandMaxDate(): void {   
  //    //start date restriction based on project from data
  //   const from_date = new Date(this.projectsData?.from_date);
  //   const year = from_date.getFullYear();
  //   const month = String(from_date.getMonth() + 1).padStart(2, '0');
  //   const day = String(from_date.getDate()).padStart(2, '0');
  //   this.minDate = `${day}-${month}-${year}`;

  //   //end date restriction based on project to data
  //   const to_date = new Date(this.projectsData?.to_date);
  //   const to_year = to_date.getFullYear();
  //   const to_month = String(to_date.getMonth() + 1).padStart(2, '0');
  //   const to_day = String(to_date.getDate()).padStart(2, '0');
    
  //   this.maxDate = `${to_day}-${to_month}-${to_year}`;
  // }

  // onChangeStartData(date:string){
  //   const from_date = new Date(date);
  //   const year = from_date.getFullYear();
  //   const month = String(from_date.getMonth() + 1).padStart(2, '0');
  //   const day = String(from_date.getDate()).padStart(2, '0');
  //   this.minEndDate = `${year}-${month}-${day}`;
  //   this.isStartDateValue=this.minEndDate ? true:false;

  // }
  testEnddate(end_date:any,start_date:any){
    if(start_date && end_date && start_date>end_date) {
        this.messageService.add({ severity: 'error', summary: 'Date validation Error', detail: 'End date must be greater than start date.' });
    }

  }

  onChangeAllocatedHours(project: any, rowIndex: number): void {
    let totalAllocated = 0;
    for (let i = 0; i < this.projectTeam.length; i++) {
      if (this.projectTeam[i].allocated_hours && i !== rowIndex) {
        totalAllocated += parseInt(this.projectTeam[i].allocated_hours, 10);
      }
    }
    const newAllocated = parseInt(project.allocated_hours, 10) || 0;
    if (totalAllocated + newAllocated > this.projectAllocatedHours) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Total allocated hours exceed project limit.' });
      //project.allocated_hours = ''; // Reset the input
    } 
    this.updateProjectAllocatedHours(0);

  }

  updateProjectAllocatedHours(delatedHours:number): void {
    this.totalprojectAllocatedHours=0;
    this.totalprojectAllocatedHours = this.projectTeam.reduce((sum, item) => {
      return sum + (parseInt(item.allocated_hours, 10) || 0);
    }, 0);
    if(delatedHours>0){
    this.allocatedHoursChanged.emit(this.totalprojectAllocatedHours-delatedHours); 
    } 
  else{
      this.allocatedHoursChanged.emit(this.totalprojectAllocatedHours); 
    }
  }

  onPhaseChange(project: any) {
    project.allocated_hours = '';
  }
 
}
