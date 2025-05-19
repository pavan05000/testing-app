import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { DisableKeysDirective } from 'src/app/directives/disable-keys.directive';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import * as XLSX from 'xlsx';
import { PMOService } from 'src/app/services/pmo.service';
import { ActivatedRouterService } from 'src/app/services/activated-router-service';
// import * as FileSaver from 'file-saver';

@Component({
  standalone: true,
  selector: 'app-pmo-report-summary',
  templateUrl: './pmo-report-summary.component.html',
  styleUrls: ['./pmo-report-summary.component.css'],
  imports: [CommonModule, FormsModule, DropdownModule, CalendarModule, 
    DisableKeysDirective, ToastModule, DialogModule]
})

export class PmoReportSummaryComponent implements OnInit {
  fromDate!: string;
  toDate!: string;
  workLogs: any = [];
  dateHeaders: string[] = [];
  selectedProject: any;
  projects:any = [];

  constructor(private http: HttpClient,
              private messageService: MessageService,
              private pmoService: PMOService,
              private activatedRouterService: ActivatedRouterService
  ) {}

  ngOnInit(): void {
    this.getProjects();  
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

  onDateChange() {
    if (this.fromDate && this.toDate) {
      const diff = new Date(this.toDate).getTime() - new Date(this.fromDate).getTime();
      const maxDiff = 30 * 24 * 60 * 60 * 1000;

      if (diff > maxDiff) {
        this.messageService.add({ severity: 'error', summary: '', detail: 'Date range cannot exceed one month' });
        this.toDate = '';
      }
    }
  }

  fetchWorkLogs() {

    if (!this.fromDate || !this.toDate || !this.selectedProject) {
      return;
    }
  
    const from = this.formatLocalDate(this.fromDate);
    const to = this.formatLocalDate(this.toDate);
    const payload = {
      "start_date": from,
      "end_date": to,
      "project_code": this.selectedProject
    }
  
    this.pmoService.getPMOReport(payload).subscribe((res) => {
      this.workLogs = res;
      this.dateHeaders = this.generateDateRange(from, to);
    });

    // this.workLogs = [
    //   {
    //     employeeCode: "PA",
    //     employeeName: "Emp one",
    //     log: {
    //       "2024-12-02": {
    //         totalHours: "06:00",
    //         details: [
    //           {
    //             phase: "Planning",
    //             taskDescription: "Sprint meeting",
    //             workedHours: "01:00",
    //             remarks: "Weekly sync-up",
    //             status: "Completed"
    //           },
    //           {
    //             phase: "Development",
    //             taskDescription: "Feature implementation",
    //             workedHours: "05:00",
    //             remarks: "Initial dev work",
    //             status: "In Progress"
    //           },
    //           {
    //             phase: "Planning",
    //             taskDescription: "Sprint meeting",
    //             workedHours: "01:00",
    //             remarks: "Weekly sync-up",
    //             status: "Completed"
    //           },
    //           {
    //             phase: "Development",
    //             taskDescription: "Feature implementation",
    //             workedHours: "05:00",
    //             remarks: "Initial dev work",
    //             status: "In Progress"
    //           },
    //           {
    //             phase: "Planning",
    //             taskDescription: "Sprint meeting",
    //             workedHours: "01:00",
    //             remarks: "Weekly sync-up",
    //             status: "Completed"
    //           },
    //           {
    //             phase: "Development",
    //             taskDescription: "Feature implementation",
    //             workedHours: "05:00",
    //             remarks: "Initial dev work",
    //             status: "In Progress"
    //           },
    //           {
    //             phase: "Planning",
    //             taskDescription: "Sprint meeting",
    //             workedHours: "01:00",
    //             remarks: "Weekly sync-up",
    //             status: "Completed"
    //           },
    //           {
    //             phase: "Development",
    //             taskDescription: "Feature implementation",
    //             workedHours: "05:00",
    //             remarks: "Initial dev work",
    //             status: "In Progress"
    //           },
    //           {
    //             phase: "Planning",
    //             taskDescription: "Sprint meeting",
    //             workedHours: "01:00",
    //             remarks: "Weekly sync-up",
    //             status: "Completed"
    //           },
    //           {
    //             phase: "Development",
    //             taskDescription: "Feature implementation",
    //             workedHours: "05:00",
    //             remarks: "Initial dev work",
    //             status: "In Progress"
    //           },
    //           {
    //             phase: "Planning",
    //             taskDescription: "Sprint meeting",
    //             workedHours: "01:00",
    //             remarks: "Weekly sync-up",
    //             status: "Completed"
    //           },
    //           {
    //             phase: "Development",
    //             taskDescription: "Feature implementation",
    //             workedHours: "05:00",
    //             remarks: "Initial dev work",
    //             status: "In Progress"
    //           },
    //           {
    //             phase: "Planning",
    //             taskDescription: "Sprint meeting",
    //             workedHours: "01:00",
    //             remarks: "Weekly sync-up",
    //             status: "Completed"
    //           },
    //           {
    //             phase: "Development",
    //             taskDescription: "Feature implementation",
    //             workedHours: "05:00",
    //             remarks: "Initial dev work",
    //             status: "In Progress"
    //           },
    //           {
    //             phase: "Planning",
    //             taskDescription: "Sprint meeting",
    //             workedHours: "01:00",
    //             remarks: "Weekly sync-up",
    //             status: "Completed"
    //           },
    //           {
    //             phase: "Development",
    //             taskDescription: "Feature implementation",
    //             workedHours: "05:00",
    //             remarks: "Initial dev work",
    //             status: "In Progress"
    //           },
    //           {
    //             phase: "Planning",
    //             taskDescription: "Sprint meeting",
    //             workedHours: "01:00",
    //             remarks: "Weekly sync-up",
    //             status: "Completed"
    //           },
    //           {
    //             phase: "Development",
    //             taskDescription: "Feature implementation",
    //             workedHours: "05:00",
    //             remarks: "Initial dev work",
    //             status: "In Progress"
    //           },
    //           {
    //             phase: "Planning",
    //             taskDescription: "Sprint meeting",
    //             workedHours: "01:00",
    //             remarks: "Weekly sync-up",
    //             status: "Completed"
    //           },
    //           {
    //             phase: "Development",
    //             taskDescription: "Feature implementation",
    //             workedHours: "05:00",
    //             remarks: "Initial dev work",
    //             status: "In Progress"
    //           }
    //         ]
    //       },
    //       "2024-12-03": {
    //         totalHours: "08:00",
    //         details: [
    //           {
    //             phase: "Development",
    //             taskDescription: "API integration",
    //             workedHours: "08:00",
    //             remarks: "Integrated login API",
    //             status: "Completed"
    //           }
    //         ]
    //       },
    //       // other dates...
    //     },
    //     total: "32:30",
    //     average: "06:30"
    //   },
    //   {
    //     employeeCode: "PA1",
    //     employeeName: "Emp two",
    //     log: {
    //       "2024-12-02": {
    //         totalHours: "08:00",
    //         details: [
    //           {
    //             phase: "Design",
    //             taskDescription: "UI Planning",
    //             workedHours: "02:00",
    //             remarks: "Wireframes created",
    //             status: "Completed"
    //           },
    //           {
    //             phase: "Development",
    //             taskDescription: "Page layout",
    //             workedHours: "06:00",
    //             remarks: "Homepage",
    //             status: "In Progress"
    //           }
    //         ]
    //       },
    //       "2024-12-03": {
    //         totalHours: "03:00",
    //         details: [
    //           {
    //             phase: "Testing",
    //             taskDescription: "Bug fixing",
    //             workedHours: "03:00",
    //             remarks: "Addressed UI issues",
    //             status: "Completed"
    //           }
    //         ]
    //       },
    //       // other dates...
    //     },
    //     total: "23:30",
    //     average: "04:42"
    //   },
    //   {
    //     employeeCode: "PA",
    //     employeeName: "Emp one",
    //     log: {
    //       "2024-12-02": {
    //         totalHours: "06:00",
    //         details: [
    //           {
    //             phase: "Planning",
    //             taskDescription: "Sprint meeting",
    //             workedHours: "01:00",
    //             remarks: "Weekly sync-up",
    //             status: "Completed"
    //           },
    //           {
    //             phase: "Development",
    //             taskDescription: "Feature implementation",
    //             workedHours: "05:00",
    //             remarks: "Initial dev work",
    //             status: "In Progress"
    //           }
    //         ]
    //       },
    //       "2024-12-03": {
    //         totalHours: "08:00",
    //         details: [
    //           {
    //             phase: "Development",
    //             taskDescription: "API integration",
    //             workedHours: "08:00",
    //             remarks: "Integrated login API",
    //             status: "Completed"
    //           }
    //         ]
    //       },
    //       // other dates...
    //     },
    //     total: "32:30",
    //     average: "06:30"
    //   },
    //   {
    //     employeeCode: "PA1",
    //     employeeName: "Emp two",
    //     log: {
    //       "2024-12-02": {
    //         totalHours: "08:00",
    //         details: [
    //           {
    //             phase: "Design",
    //             taskDescription: "UI Planning",
    //             workedHours: "02:00",
    //             remarks: "Wireframes created",
    //             status: "Completed"
    //           },
    //           {
    //             phase: "Development",
    //             taskDescription: "Page layout",
    //             workedHours: "06:00",
    //             remarks: "Homepage",
    //             status: "In Progress"
    //           }
    //         ]
    //       },
    //       "2024-12-03": {
    //         totalHours: "03:00",
    //         details: [
    //           {
    //             phase: "Testing",
    //             taskDescription: "Bug fixing",
    //             workedHours: "03:00",
    //             remarks: "Addressed UI issues",
    //             status: "Completed"
    //           }
    //         ]
    //       },
    //       // other dates...
    //     },
    //     total: "23:30",
    //     average: "04:42"
    //   },
    //   {
    //     employeeCode: "PA",
    //     employeeName: "Emp one",
    //     log: {
    //       "2024-12-02": {
    //         totalHours: "06:00",
    //         details: [
    //           {
    //             phase: "Planning",
    //             taskDescription: "Sprint meeting",
    //             workedHours: "01:00",
    //             remarks: "Weekly sync-up",
    //             status: "Completed"
    //           },
    //           {
    //             phase: "Development",
    //             taskDescription: "Feature implementation",
    //             workedHours: "05:00",
    //             remarks: "Initial dev work",
    //             status: "In Progress"
    //           }
    //         ]
    //       },
    //       "2024-12-03": {
    //         totalHours: "08:00",
    //         details: [
    //           {
    //             phase: "Development",
    //             taskDescription: "API integration",
    //             workedHours: "08:00",
    //             remarks: "Integrated login API",
    //             status: "Completed"
    //           }
    //         ]
    //       },
    //       // other dates...
    //     },
    //     total: "32:30",
    //     average: "06:30"
    //   },
    //   {
    //     employeeCode: "PA1",
    //     employeeName: "Emp two",
    //     log: {
    //       "2024-12-02": {
    //         totalHours: "08:00",
    //         details: [
    //           {
    //             phase: "Design",
    //             taskDescription: "UI Planning",
    //             workedHours: "02:00",
    //             remarks: "Wireframes created",
    //             status: "Completed"
    //           },
    //           {
    //             phase: "Development",
    //             taskDescription: "Page layout",
    //             workedHours: "06:00",
    //             remarks: "Homepage",
    //             status: "In Progress"
    //           }
    //         ]
    //       },
    //       "2024-12-03": {
    //         totalHours: "03:00",
    //         details: [
    //           {
    //             phase: "Testing",
    //             taskDescription: "Bug fixing",
    //             workedHours: "03:00",
    //             remarks: "Addressed UI issues",
    //             status: "Completed"
    //           }
    //         ]
    //       },
    //       // other dates...
    //     },
    //     total: "23:30",
    //     average: "04:42"
    //   },
    //   {
    //     employeeCode: "PA",
    //     employeeName: "Emp one",
    //     log: {
    //       "2024-12-02": {
    //         totalHours: "06:00",
    //         details: [
    //           {
    //             phase: "Planning",
    //             taskDescription: "Sprint meeting",
    //             workedHours: "01:00",
    //             remarks: "Weekly sync-up",
    //             status: "Completed"
    //           },
    //           {
    //             phase: "Development",
    //             taskDescription: "Feature implementation",
    //             workedHours: "05:00",
    //             remarks: "Initial dev work",
    //             status: "In Progress"
    //           }
    //         ]
    //       },
    //       "2024-12-03": {
    //         totalHours: "08:00",
    //         details: [
    //           {
    //             phase: "Development",
    //             taskDescription: "API integration",
    //             workedHours: "08:00",
    //             remarks: "Integrated login API",
    //             status: "Completed"
    //           }
    //         ]
    //       },
    //       // other dates...
    //     },
    //     total: "32:30",
    //     average: "06:30"
    //   },
    //   {
    //     employeeCode: "PA1",
    //     employeeName: "Emp two",
    //     log: {
    //       "2024-12-02": {
    //         totalHours: "08:00",
    //         details: [
    //           {
    //             phase: "Design",
    //             taskDescription: "UI Planning",
    //             workedHours: "02:00",
    //             remarks: "Wireframes created",
    //             status: "Completed"
    //           },
    //           {
    //             phase: "Development",
    //             taskDescription: "Page layout",
    //             workedHours: "06:00",
    //             remarks: "Homepage",
    //             status: "In Progress"
    //           }
    //         ]
    //       },
    //       "2024-12-03": {
    //         totalHours: "03:00",
    //         details: [
    //           {
    //             phase: "Testing",
    //             taskDescription: "Bug fixing",
    //             workedHours: "03:00",
    //             remarks: "Addressed UI issues",
    //             status: "Completed"
    //           }
    //         ]
    //       },
    //       // other dates...
    //     },
    //     total: "23:30",
    //     average: "04:42"
    //   },
    //   {
    //     employeeCode: "PA",
    //     employeeName: "Emp one",
    //     log: {
    //       "2024-12-02": {
    //         totalHours: "06:00",
    //         details: [
    //           {
    //             phase: "Planning",
    //             taskDescription: "Sprint meeting",
    //             workedHours: "01:00",
    //             remarks: "Weekly sync-up",
    //             status: "Completed"
    //           },
    //           {
    //             phase: "Development",
    //             taskDescription: "Feature implementation",
    //             workedHours: "05:00",
    //             remarks: "Initial dev work",
    //             status: "In Progress"
    //           }
    //         ]
    //       },
    //       "2024-12-03": {
    //         totalHours: "08:00",
    //         details: [
    //           {
    //             phase: "Development",
    //             taskDescription: "API integration",
    //             workedHours: "08:00",
    //             remarks: "Integrated login API",
    //             status: "Completed"
    //           }
    //         ]
    //       },
    //       // other dates...
    //     },
    //     total: "32:30",
    //     average: "06:30"
    //   },
    //   {
    //     employeeCode: "PA1",
    //     employeeName: "Emp two",
    //     log: {
    //       "2024-12-02": {
    //         totalHours: "08:00",
    //         details: [
    //           {
    //             phase: "Design",
    //             taskDescription: "UI Planning",
    //             workedHours: "02:00",
    //             remarks: "Wireframes created",
    //             status: "Completed"
    //           },
    //           {
    //             phase: "Development",
    //             taskDescription: "Page layout",
    //             workedHours: "06:00",
    //             remarks: "Homepage",
    //             status: "In Progress"
    //           }
    //         ]
    //       },
    //       "2024-12-03": {
    //         totalHours: "03:00",
    //         details: [
    //           {
    //             phase: "Testing",
    //             taskDescription: "Bug fixing",
    //             workedHours: "03:00",
    //             remarks: "Addressed UI issues",
    //             status: "Completed"
    //           }
    //         ]
    //       },
    //       // other dates...
    //     },
    //     total: "23:30",
    //     average: "04:42"
    //   },
    //   {
    //     employeeCode: "PA",
    //     employeeName: "Emp one",
    //     log: {
    //       "2024-12-02": {
    //         totalHours: "06:00",
    //         details: [
    //           {
    //             phase: "Planning",
    //             taskDescription: "Sprint meeting",
    //             workedHours: "01:00",
    //             remarks: "Weekly sync-up",
    //             status: "Completed"
    //           },
    //           {
    //             phase: "Development",
    //             taskDescription: "Feature implementation",
    //             workedHours: "05:00",
    //             remarks: "Initial dev work",
    //             status: "In Progress"
    //           }
    //         ]
    //       },
    //       "2024-12-03": {
    //         totalHours: "08:00",
    //         details: [
    //           {
    //             phase: "Development",
    //             taskDescription: "API integration",
    //             workedHours: "08:00",
    //             remarks: "Integrated login API",
    //             status: "Completed"
    //           }
    //         ]
    //       },
    //       // other dates...
    //     },
    //     total: "32:30",
    //     average: "06:30"
    //   },
    //   {
    //     employeeCode: "PA1",
    //     employeeName: "Emp two",
    //     log: {
    //       "2024-12-02": {
    //         totalHours: "08:00",
    //         details: [
    //           {
    //             phase: "Design",
    //             taskDescription: "UI Planning",
    //             workedHours: "02:00",
    //             remarks: "Wireframes created",
    //             status: "Completed"
    //           },
    //           {
    //             phase: "Development",
    //             taskDescription: "Page layout",
    //             workedHours: "06:00",
    //             remarks: "Homepage",
    //             status: "In Progress"
    //           }
    //         ]
    //       },
    //       "2024-12-03": {
    //         totalHours: "03:00",
    //         details: [
    //           {
    //             phase: "Testing",
    //             taskDescription: "Bug fixing",
    //             workedHours: "03:00",
    //             remarks: "Addressed UI issues",
    //             status: "Completed"
    //           }
    //         ]
    //       },
    //       // other dates...
    //     },
    //     total: "23:30",
    //     average: "04:42"
    //   },
    //   {
    //     employeeCode: "PA",
    //     employeeName: "Emp one",
    //     log: {
    //       "2024-12-02": {
    //         totalHours: "06:00",
    //         details: [
    //           {
    //             phase: "Planning",
    //             taskDescription: "Sprint meeting",
    //             workedHours: "01:00",
    //             remarks: "Weekly sync-up",
    //             status: "Completed"
    //           },
    //           {
    //             phase: "Development",
    //             taskDescription: "Feature implementation",
    //             workedHours: "05:00",
    //             remarks: "Initial dev work",
    //             status: "In Progress"
    //           }
    //         ]
    //       },
    //       "2024-12-03": {
    //         totalHours: "08:00",
    //         details: [
    //           {
    //             phase: "Development",
    //             taskDescription: "API integration",
    //             workedHours: "08:00",
    //             remarks: "Integrated login API",
    //             status: "Completed"
    //           }
    //         ]
    //       },
    //       // other dates...
    //     },
    //     total: "32:30",
    //     average: "06:30"
    //   },
    //   {
    //     employeeCode: "PA1",
    //     employeeName: "Emp two",
    //     log: {
    //       "2024-12-02": {
    //         totalHours: "08:00",
    //         details: [
    //           {
    //             phase: "Design",
    //             taskDescription: "UI Planning",
    //             workedHours: "02:00",
    //             remarks: "Wireframes created",
    //             status: "Completed"
    //           },
    //           {
    //             phase: "Development",
    //             taskDescription: "Page layout",
    //             workedHours: "06:00",
    //             remarks: "Homepage",
    //             status: "In Progress"
    //           }
    //         ]
    //       },
    //       "2024-12-03": {
    //         totalHours: "03:00",
    //         details: [
    //           {
    //             phase: "Testing",
    //             taskDescription: "Bug fixing",
    //             workedHours: "03:00",
    //             remarks: "Addressed UI issues",
    //             status: "Completed"
    //           }
    //         ]
    //       },
    //       // other dates...
    //     },
    //     total: "23:30",
    //     average: "04:42"
    //   },
    //   {
    //     employeeCode: "PA",
    //     employeeName: "Emp one",
    //     log: {
    //       "2024-12-02": {
    //         totalHours: "06:00",
    //         details: [
    //           {
    //             phase: "Planning",
    //             taskDescription: "Sprint meeting",
    //             workedHours: "01:00",
    //             remarks: "Weekly sync-up",
    //             status: "Completed"
    //           },
    //           {
    //             phase: "Development",
    //             taskDescription: "Feature implementation",
    //             workedHours: "05:00",
    //             remarks: "Initial dev work",
    //             status: "In Progress"
    //           }
    //         ]
    //       },
    //       "2024-12-03": {
    //         totalHours: "08:00",
    //         details: [
    //           {
    //             phase: "Development",
    //             taskDescription: "API integration",
    //             workedHours: "08:00",
    //             remarks: "Integrated login API",
    //             status: "Completed"
    //           }
    //         ]
    //       },
    //       // other dates...
    //     },
    //     total: "32:30",
    //     average: "06:30"
    //   },
    //   {
    //     employeeCode: "PA1",
    //     employeeName: "Emp two",
    //     log: {
    //       "2024-12-02": {
    //         totalHours: "08:00",
    //         details: [
    //           {
    //             phase: "Design",
    //             taskDescription: "UI Planning",
    //             workedHours: "02:00",
    //             remarks: "Wireframes created",
    //             status: "Completed"
    //           },
    //           {
    //             phase: "Development",
    //             taskDescription: "Page layout",
    //             workedHours: "06:00",
    //             remarks: "Homepage",
    //             status: "In Progress"
    //           }
    //         ]
    //       },
    //       "2024-12-03": {
    //         totalHours: "03:00",
    //         details: [
    //           {
    //             phase: "Testing",
    //             taskDescription: "Bug fixing",
    //             workedHours: "03:00",
    //             remarks: "Addressed UI issues",
    //             status: "Completed"
    //           }
    //         ]
    //       },
    //       // other dates...
    //     },
    //     total: "23:30",
    //     average: "04:42"
    //   }
    // ];
    
    this.dateHeaders = this.generateDateRange(this.fromDate, this.toDate)

  }

  formatLocalDate(date: any): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  generateDateRange(from: string, to: string): string[] {
    const dates: string[] = [];
    let current = new Date(from);
    const end = new Date(to);
  
    while (current <= end) {
      const year = current.getFullYear();
      const month = ('0' + (current.getMonth() + 1)).slice(-2);
      const day = ('0' + current.getDate()).slice(-2);
      dates.push(`${year}-${month}-${day}`);
      current.setDate(current.getDate() + 1);
    }
  
    return dates;
  }  

  // getDailyTotal(date: string): string {
  //   let totalMinutes = 0;
  //   for (const log of this.workLogs) {
  //     if (log.log[date]) {
  //       const [h, m] = log.log[date].split(':').map(Number);
  //       totalMinutes += h * 60 + m;
  //     }
  //   }
  //   return this.formatMinutes(totalMinutes);
  // }

  // getOverallTotal(): string {
  //   let totalMinutes = 0;
  //   for (const log of this.workLogs) {
  //     const [h, m] = log.total.split(':').map(Number);
  //     totalMinutes += h * 60 + m;
  //   }
  //   return this.formatMinutes(totalMinutes);
  // }

  // getDailyAverage(date: string): string {
  //   const values = this.workLogs.map((log:any) => log.log[date]).filter(Boolean);
  //   if (values.length === 0) return '-';
  //   let total = 0;
  //   for (const v of values) {
  //     const [h, m] = v.split(':').map(Number);
  //     total += h * 60 + m;
  //   }
  //   return this.formatMinutes(total / values.length);
  // }

  // getAverageTotal(): string {
  //   return this.formatMinutes(this.getOverallMinutes() / this.workLogs.length);
  // }

  // getOverallAverage(): string {
  //   const allDays = this.dateHeaders.length;
  //   return this.formatMinutes(this.getOverallMinutes() / allDays);
  // }

  // private getOverallMinutes(): number {
  //   return this.workLogs.reduce((acc:any, log:any) => {
  //     const [h, m] = log.total.split(':').map(Number);
  //     return acc + h * 60 + m;
  //   }, 0);
  // }

  // formatMinutes(mins: number): string {
  //   const h = Math.floor(mins / 60);
  //   const m = Math.round(mins % 60);
  //   return `${this.padZero(h)}:${this.padZero(m)}`;
  // }

  // padZero(val: number): string {
  //   return val < 10 ? `0${val}` : `${val}`;
  // }

  isFormValid(): boolean {
    return !!(
      this.fromDate &&
      this.toDate &&
      this.selectedProject &&
      new Date(this.toDate) >= new Date(this.fromDate)
    );
  }

  isDateValid() {
    return this.fromDate && this.toDate && new Date(this.toDate) < new Date(this.fromDate)
  }

  // dialog related logic starts here
  showBreakupDialog = false;
  selectedBreakupData: any[] = [];
  selectedEmployee: string = '';
  selectedDate: string = '';
  totalWorkedHours: string = '';

  openBreakupDialog(log: any, date: string): void {
    this.selectedEmployee = log.employee_name;
    this.selectedDate = date;
    this.totalWorkedHours = log?.log[date]?.total_hours;

    const cellData = log.log[date];
    this.selectedBreakupData = Array.isArray(cellData?.details) ? cellData.details : [];
    this.showBreakupDialog = true;
  }

  openTotalBreakupDialog(log: any) {
    this.selectedEmployee = log.employee_name;
    this.totalWorkedHours = log.total;

    const employee = this.workLogs.find((worklog:any) => worklog.employee_code === log.employee_code);
    this.selectedBreakupData = [];
    // console.log(Object.entries(employee.log))
  
    if (employee && employee.log) {
      for (const [date, logEntry] of Object.entries(employee.log)) {
        const entry = logEntry as {
          details: {
            date: string,
            emp_code: string,
            emp_name: string,
            project_name: string,
            phase: string;
            task_description: string;
            worked_hours: string;
            remarks: string;
            status: string;
          }[];
        };
  
        entry.details.forEach((detail: any) => {
          this.selectedBreakupData.push({
            ...detail,
            // date, // optional, if you want to include it
          });
        });
      }
      
      // Sort selectedBreakupData by date in ascending order
      this.selectedBreakupData.sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      this.showBreakupDialog = true;
    }
  }

  formatDateToDDMMYYYY(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  isDownloadVisible(): boolean {
    if (!this.totalWorkedHours) return false;
  
    const [hours, minutes] = this.totalWorkedHours.split(':').map(Number);
    return (hours + minutes) > 0;
  }  

  downloadXLSX(): void {
    const worksheetData = [
      ['Date', 'Employee Code', 'Employee Name', 'Project Name' ,'Phase', 'Task Description', 'Worked HRS', 'Remarks', 'Status'],
      ...this.selectedBreakupData.map((item) => [
        // this.selectedDate,
        // this.selectedEmployee,
        item.date = this.formatDateToDDMMYYYY(item.date),
        item.emp_code,
        item.emp_name,
        item.project_name,
        item.phase,
        item.task_description,
        item.worked_hours,
        item.remarks,
        item.status,
      ]),
    ];
  
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Work Log': worksheet },
      SheetNames: ['Work Log']
    };
  
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });  
    const filename = `${this.selectedEmployee}_${this.selectedDate}.xlsx`;
    this.saveExcelFile(excelBuffer, filename);
  }

  // Function to save the Excel file
  private saveExcelFile(buffer: any, filename: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' }); // Removed bookType
    const link = document.createElement('a');
    link.href = URL.createObjectURL(data);
    link.download = filename;
    link.click();
  }

}
