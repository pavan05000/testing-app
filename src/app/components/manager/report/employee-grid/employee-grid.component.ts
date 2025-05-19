import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
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
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-employee-grid',
  imports: [ReactiveFormsModule, ToastModule, CommonModule, DropdownModule, ButtonModule,
    InputTextModule, TableModule, FormsModule, IconFieldModule,MultiSelectModule],
    standalone:true,
  templateUrl: './employee-grid.component.html',
  styleUrls: ['./employee-grid.component.scss'],
  providers:[MessageService]
})
export class EmployeeGridComponent implements OnInit{
  @Input() employeeSummaryReport:any[]=[];
  @Input() employeeDetailReport:any[]=[];
  constructor(private messageService:MessageService,private activatedRouterService:ActivatedRouterService){}

  ngOnInit(): void {
    
  }

  formatIndianNumber(x: number): string {
    const [integerPart, decimalPart] = x.toString().split('.');
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    const formattedInteger = otherNumbers !== ''
      ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + ',' + lastThree
      : lastThree;
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  }     

   exportToExcel(): void {
      if(this.employeeSummaryReport.length>0){
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.employeeSummaryReport); // or projectDetailReport depending on what you want
      const workbook: XLSX.WorkBook = { 
        Sheets: { 'data': worksheet },
        SheetNames: ['data']
      };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveExcelFile(excelBuffer, 'Employee_Summary_Report.xlsx');
    }
    if(this.employeeDetailReport.length>0){
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.employeeDetailReport); // or projectDetailReport depending on what you want
      const workbook: XLSX.WorkBook = { 
        Sheets: { 'data': worksheet },
        SheetNames: ['data']
      };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveExcelFile(excelBuffer, 'Employee_Detail_Report.xlsx');
    }
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
