import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { companymodel } from '../Model/companymodel';
import { ApiService } from '../shared/api.service';
import * as alertify from 'alertifyjs';
import { PopupComponent } from '../popup/popup.component';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css']
})
export class CompanyComponent implements OnInit {

  @ViewChild(MatPaginator) _paginator!: MatPaginator;
  @ViewChild(MatSort) _sort!: MatSort;
  companydata!: companymodel[];
  finaldata!: MatTableDataSource<companymodel>;

  displayColumns: string[] = ["serialNumber", "id", "name", "empcount", "revenue", "address", "isactive", "action"];

  constructor(private dialog: MatDialog, private api: ApiService) { }

  ngOnInit(): void {
    this.LoadCompany();
  }

  Openpopup(id: string | null) {
    const _popup = this.dialog.open(PopupComponent, {
      width: '500px',
      exitAnimationDuration: '1000ms',
      enterAnimationDuration: '1000ms',
      data: { id: id }
    });

    _popup.afterClosed().subscribe(result => {
      if (result) {
        this.LoadCompany();
      }
    });
  }

  LoadCompany() {
    this.api.GetAllCompanies().subscribe((response: companymodel[]) => {
      this.companydata = response;
      this.finaldata = new MatTableDataSource<companymodel>(this.companydata);
      this.finaldata.paginator = this._paginator;
      this.finaldata.sort = this._sort;
    }, (error: any) => {
      alertify.error("Failed to load companies.");
    });
  }

  RemoveCompany(id: string) {
    alertify.confirm("Remove Company", "Do you want to remove this company?", () => {
      this.api.RemoveCompanyById(id).subscribe(() => {
        this.LoadCompany();
      }, (error: any) => {
        alertify.error("Failed to remove company.");
      });
    }, function () {
      // Handle cancellation if needed
    });
  }

  applyFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    const filterValue = input.value.trim().toLowerCase();
    this.finaldata.filter = filterValue;

    if (this.finaldata.paginator) {
      this.finaldata.paginator.firstPage();
    }
  }

  getSerialNumber(index: number): number {
    // Ensure paginator is not null before accessing properties
    const pageIndex = this.finaldata.paginator?.pageIndex ?? 0;
    const pageSize = this.finaldata.paginator?.pageSize ?? 0;

    return (pageIndex * pageSize) + (index + 1);
  }
}
