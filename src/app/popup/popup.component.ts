
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from '../shared/api.service';
import * as alertify from 'alertifyjs';
import { companymodel } from '../Model/companymodel';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit {
  companyform: FormGroup;

  constructor(
    private builder: FormBuilder,
    private api: ApiService,
    public dialogRef: MatDialogRef<PopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string | null }
  ) {
    this.companyform = this.builder.group({
      id: [{ value: '', disabled: !!data.id }, [Validators.required, Validators.pattern('^[0-9]*$')]], // Numeric ID
      name: ['', Validators.required],
      empcount: ['', [Validators.required, Validators.min(0)]],
      revenue: ['', [Validators.required, Validators.min(0)]],
      address: ['', Validators.required],
      isactive: [true]
    });
  }

  ngOnInit(): void {
    if (this.data.id) {
      this.api.GetCompanyById(this.data.id).subscribe((response: companymodel | null) => {
        if (response) {
          const companyData = {
            ...response,
            id: response.id.toString(), // Convert ID to string if needed
            empcount: response.empcount.toString(),
            revenue: response.revenue.toString()
          };
          this.companyform.patchValue(companyData);
          this.companyform.get('id')?.disable(); // Disable ID field when editing
        } else {
          alertify.error("Company not found.");
        }
      }, (error: any) => {
        alertify.error("Failed to load company data.");
      });
    }
  }

  SaveCompany() {
    if (this.companyform.valid) {
      const formValue = this.companyform.value;

      if (this.data.id) {
        // Update existing company
        this.api.UpdateCompany(this.data.id, formValue).subscribe((response: companymodel | null) => {
          if (response) {
            this.closePopup();
            alertify.success("Updated successfully.");
          } else {
            alertify.error("Update failed.");
          }
        }, (error: any) => {
          alertify.error("Update failed.");
        });
      } else {
        // Create a new company
        this.api.CreateCompany(formValue).subscribe((response: companymodel | null) => {
          if (response) {
            this.closePopup();
            alertify.success("Saved successfully.");
          } else {
            alertify.error("Save failed.");
          }
        }, (error: any) => {
          alertify.error("Save failed.");
        });
      }
    }
  }

  closePopup() {
    this.dialogRef.close();
  }
}
