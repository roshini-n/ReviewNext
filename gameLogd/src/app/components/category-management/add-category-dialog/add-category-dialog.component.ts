import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { CategoryField } from '../../../models/category.model';

@Component({
  selector: 'app-add-category-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatCheckboxModule
  ],
  template: `
    <h2 mat-dialog-title style="color: #7b1fa2; font-weight: bold;">Add New Category</h2>
    <mat-dialog-content>
      <form [formGroup]="categoryForm" class="category-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Category Name</mat-label>
          <input matInput formControlName="name" placeholder="e.g., Board Games">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Category ID</mat-label>
          <input matInput formControlName="id" placeholder="e.g., board-games">
          <mat-hint>This will be used in URLs (lowercase, with hyphens)</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" 
                    placeholder="Brief description of this category"></textarea>
        </mat-form-field>

        <div class="fields-section">
          <h3 style="color: #7b1fa2; margin-bottom: 16px;">Category Fields</h3>
          <div formArrayName="fields">
            @for (field of fieldsArray.controls; track $index) {
              <div [formGroupName]="$index" class="field-group">
                <div class="field-row">
                  <mat-form-field appearance="outline" class="field-name">
                    <mat-label>Field Name</mat-label>
                    <input matInput formControlName="name" placeholder="e.g., title">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="field-type">
                    <mat-label>Type</mat-label>
                    <mat-select formControlName="type">
                      <mat-option value="text">Text</mat-option>
                      <mat-option value="number">Number</mat-option>
                      <mat-option value="date">Date</mat-option>
                      <mat-option value="url">URL</mat-option>
                      <mat-option value="textarea">Long Text</mat-option>
                      <mat-option value="boolean">Yes/No</mat-option>
                      <mat-option value="array">List</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <button mat-icon-button type="button" (click)="removeField($index)" 
                          [disabled]="fieldsArray.length <= 1" class="remove-btn">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Display Label</mat-label>
                  <input matInput formControlName="label" placeholder="e.g., Game Title">
                </mat-form-field>

                <div class="field-options">
                  <mat-checkbox formControlName="required">Required Field</mat-checkbox>
                </div>
              </div>
            }
          </div>

          <button mat-button type="button" (click)="addField()" class="add-field-btn">
            <mat-icon>add</mat-icon>
            Add Field
          </button>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button [disabled]="categoryForm.invalid" 
              (click)="onSubmit()" class="submit-btn">
        Create Category
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .category-form {
      width: 500px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .fields-section {
      margin-top: 24px;
      border-top: 1px solid #e0e0e0;
      padding-top: 16px;
    }

    .field-group {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      background-color: #fafafa;
    }

    .field-row {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 12px;
    }

    .field-name {
      flex: 2;
    }

    .field-type {
      flex: 1;
    }

    .remove-btn {
      color: #f44336;
    }

    .field-options {
      margin-top: 8px;
    }

    .add-field-btn {
      color: #7b1fa2;
      border: 1px dashed #7b1fa2;
      width: 100%;
      margin-top: 8px;
    }

    .submit-btn {
      background: linear-gradient(135deg, #7b1fa2 0%, #4a148c 100%);
      color: white;
    }

    mat-checkbox {
      color: #7b1fa2;
    }

    ::ng-deep .mat-mdc-checkbox .mdc-checkbox__checkmark {
      color: white;
    }

    ::ng-deep .mat-mdc-checkbox.mat-mdc-checkbox-checked .mdc-checkbox__background {
      background-color: #7b1fa2;
      border-color: #7b1fa2;
    }
  `]
})
export class AddCategoryDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddCategoryDialogComponent>);

  categoryForm: FormGroup;

  constructor() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      id: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      description: ['', Validators.required],
      fields: this.fb.array([this.createFieldGroup()])
    });

    // Auto-generate ID from name
    this.categoryForm.get('name')?.valueChanges.subscribe(name => {
      if (name) {
        const id = name.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        this.categoryForm.get('id')?.setValue(id);
      }
    });
  }

  get fieldsArray(): FormArray {
    return this.categoryForm.get('fields') as FormArray;
  }

  createFieldGroup(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z0-9_]*$/)]],
      label: ['', Validators.required],
      type: ['text', Validators.required],
      required: [false]
    });
  }

  addField(): void {
    this.fieldsArray.push(this.createFieldGroup());
  }

  removeField(index: number): void {
    if (this.fieldsArray.length > 1) {
      this.fieldsArray.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      const formValue = this.categoryForm.value;
      
      // Ensure we have required default fields
      const defaultFields: CategoryField[] = [
        { 
          id: 'title', 
          name: 'title', 
          displayName: 'Title',
          label: 'Title', 
          type: 'text', 
          required: true 
        },
        { 
          id: 'description', 
          name: 'description', 
          displayName: 'Description',
          label: 'Description', 
          type: 'textarea', 
          required: true 
        },
        { 
          id: 'imageUrl', 
          name: 'imageUrl', 
          displayName: 'Image URL',
          label: 'Image URL', 
          type: 'url', 
          required: false 
        }
      ];

      // Merge user-defined fields with defaults
      const userFields: CategoryField[] = formValue.fields.map((field: any, index: number) => ({
        id: `${formValue.id}_${field.name}`,
        name: field.name,
        displayName: field.label,
        label: field.label,
        type: field.type,
        required: field.required
      }));

      // Remove duplicates (user fields override defaults)
      const allFields = [...defaultFields];
      userFields.forEach(userField => {
        const existingIndex = allFields.findIndex(f => f.name === userField.name);
        if (existingIndex >= 0) {
          allFields[existingIndex] = userField;
        } else {
          allFields.push(userField);
        }
      });

      const categoryData = {
        name: formValue.name,
        id: formValue.id,
        description: formValue.description,
        fields: allFields,
        isActive: true,
        createdAt: new Date(),
        itemCount: 0
      };

      this.dialogRef.close(categoryData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}