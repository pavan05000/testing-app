import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { UserService } from '../../../services/user.service';
import { MessageService } from 'primeng/api';
import { ActivatedRouterService } from '../../../services/activated-router-service';
import { PMOService} from '../../../services/pmo.service';
import { pmo } from '../../../models/pmo';
@Component({
    selector: 'app-view-project-assignment',
    imports: [ToastModule, CommonModule, ReactiveFormsModule, CalendarModule, FormsModule, CheckboxModule, RadioButtonModule],
    templateUrl: './view-project-assignment.component.html',
    styleUrls: ['./view-project-assignment.component.scss'],
    providers: [MessageService],
    standalone:true
})
export class ViewProjectAssignmentComponent implements OnInit{
  project_code:string='';
 // projectForm!: FormGroup;
  projects:pmo=new pmo();
  constructor(
    private router:Router,
    private formBuilder:FormBuilder,
    private activatedRoute:ActivatedRoute,
    private userService:UserService,private messageService: MessageService,
        private activatedRouterService: ActivatedRouterService,private pmoService:PMOService
  ) {}

  ngOnInit(): void {
    // this.projectForm = this.formBuilder.group({
    //   project_code: new FormControl(''),
    //   project_name:new FormControl(''),
    //   project_description: new FormControl(''),
    //   project_type: new FormControl(''),
    //   project_category: new FormControl(''),
    //   project_status: new FormControl(''),
    //   project_manager: new FormControl(''),
    //   from_date: new FormControl(''),
    //   to_date:new FormControl(''),
    //   client_name: new FormControl(''),
    //   project_region: new FormControl(''),
    //   project_country: new FormControl(''),
    //   delivery_model: new FormControl(''),
    //   budgeted_hours: new FormControl(''),
    //   allocated_hours: new FormControl(''),
    //   worked_hours: new FormControl(''),
    //   notes: new FormControl('')     
    // })

    this.activatedRoute.queryParams.subscribe((res) => {
      this.project_code=res['id']
    });
    this.getProjectsById()
  }

  getProjectsById(){
    this.pmoService.getProjectsById(this.project_code).subscribe(res=>{
     this.projects=res['project'];
    //  this.projectForm.patchValue({
    //   project_code: this.projects?.project_code,
    //   project_name:this.projects?.project_name,
    //   project_category: this.projects?.project_category,
    //   project_type: this.projects?.project_type,
    //   project_description: this.projects?.project_description,
    //   project_country: this.projects?.project_country,
    //   project_manager: this.projects?.project_manager,
    //   project_region: this.projects?.project_region,
    //   client_name: this.projects?.client_name,
    //   delivery_model: this.projects?.delivery_model,
    //   budgeted_hours: this.projects?.budgeted_hours,
    //   worked_hours: this.projects?.worked_hours,
    //   allocated_hours: this.projects?.allocated_hours,
    //   notes: this.projects?.notes, 
    //   from_date: this.changeFormat(this.projects?.from_date),
    //   to_date: this.changeFormat(this.projects?.to_date),
    //    project_status: this.projects?.project_status=='active' ? 'Active' : 'Inactive'
    // });
   },(err: any) => { 
     this.activatedRouterService.updateError(err, this.messageService)
   })
 }

  navigateToGrid() {
    this.router.navigate(['/pmo/project-assignment']);
  }

  navigateToEditProject() {
    this.router.navigate(['/pmo/edit-project-assignment',this.project_code]);
  }

  changeFormat(dateToTransfer:string){
    const date = new Date(dateToTransfer);
    const formattedDate = date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0');
    return formattedDate
  }
}
