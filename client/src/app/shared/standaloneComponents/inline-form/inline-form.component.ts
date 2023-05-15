import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'inline-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './inline-form.component.html',
})
export class InlineFormComponent {
    @Input() title = '';
    @Input() defaultText = 'Not defined';
    @Input() buttonText = 'Submit';
    @Input() placeholder = '';
    @Input() inputType = 'input';
    @Input() hasButton = false;

    @Output() handleSubmit = new EventEmitter<string>();

    isEditing = false;

    form = this.fb.group({
        title: ['']
    });

    constructor(private fb: FormBuilder) {}

    activeEdit() {
        if (this.title) {
            this.form.patchValue({title: this.title});
        }
        this.isEditing= true;
    }

    onSubmit() {
        if (this.form.value.title) {
            this.handleSubmit.emit(this.form.value.title);
        }
        this.isEditing = false;
        this.form.reset();
    }
}
