import { StorageService } from './storage.js';
import { IForm, IFormField, FieldType, IFieldOption, DragPosition } from './types.js';

export class FormBuilder {
    private storageService: StorageService;
    private currentForm: IForm | null = null;
    private formContainer: HTMLElement;
    private fieldListContainer: HTMLElement;

    constructor() {
        this.storageService = new StorageService();
        this.formContainer = document.getElementById('formBuilder') as HTMLElement;
        this.fieldListContainer = document.getElementById('fieldList') as HTMLElement;
        this.initializeEventListeners();
        this.initializeDragAndDrop();
    }

    private initializeEventListeners(): void {
        const addFieldBtn = document.getElementById('addFieldBtn');
        if (addFieldBtn) {
            addFieldBtn.addEventListener('click', () => this.showAddFieldDialog());
        }

        const saveFormBtn = document.getElementById('saveFormBtn');
        if (saveFormBtn) {
            saveFormBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveForm();
            });
        }

        const addFieldConfirmBtn = document.getElementById('addFieldConfirm');
        if (addFieldConfirmBtn) {
            addFieldConfirmBtn.addEventListener('click', () => this.addNewField());
        }

        const cancelFieldAddBtn = document.getElementById('cancelFieldAdd');
        if (cancelFieldAddBtn) {
            cancelFieldAddBtn.addEventListener('click', () => this.hideAddFieldDialog());
        }

        const fieldTypeSelect = document.getElementById('fieldType');
        if (fieldTypeSelect) {
            fieldTypeSelect.addEventListener('change', () => {
                this.resetOptionsContainer();
                this.toggleOptionsContainer();
            });
        }

        const addOptionBtn = document.getElementById('addOptionBtn');
        if (addOptionBtn) {
            addOptionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addOptionField();
            });
        }
    }

    private resetOptionsContainer(): void {
        const optionsContainer = document.getElementById('optionsContainer') as HTMLElement;
        optionsContainer.innerHTML = '';
        const addOptionBtn = document.getElementById('addOptionBtn') as HTMLElement;
        addOptionBtn.style.display = 'none';
    }

    public createNewForm(): void {
        this.currentForm = {
            id: crypto.randomUUID(),
            title: '',
            fields: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.renderFormBuilder();
    }

    public loadForm(formId: string): void {
        const form = this.storageService.getFormById(formId);
        if (form) {
            this.currentForm = form;
            this.renderFormBuilder();
        }
    }

    private showAddFieldDialog(): void {
        if (this.currentForm) {
            const titleInput = document.getElementById('formTitle') as HTMLInputElement;
            this.currentForm.title = titleInput.value;
        }
    
        const dialog = document.getElementById('fieldTypeDialog') as HTMLElement;
        dialog.style.display = 'block';
    
        (document.getElementById('fieldLabel') as HTMLInputElement).value = '';
        (document.getElementById('fieldType') as HTMLSelectElement).value = FieldType.TEXT;
        this.resetOptionsContainer();
        this.toggleOptionsContainer();
    }

    private hideAddFieldDialog(): void {
        const dialog = document.getElementById('fieldTypeDialog') as HTMLElement;
        dialog.style.display = 'none';
        this.resetOptionsContainer();
    }

    private toggleOptionsContainer(): void {
        const fieldType = (document.getElementById('fieldType') as HTMLSelectElement).value;
        const optionsContainer = document.getElementById('optionsContainer') as HTMLElement;
        const addOptionBtn = document.getElementById('addOptionBtn') as HTMLElement;

        if (fieldType === FieldType.RADIO || fieldType === FieldType.CHECKBOX) {
            optionsContainer.style.display = 'block';
            addOptionBtn.style.display = 'block';

            if (optionsContainer.children.length === 0) {
                this.addOptionField();
            }
        } else {
            optionsContainer.style.display = 'none';
            addOptionBtn.style.display = 'none';
        }
    }

    private addOptionField(): void {
        const optionsContainer = document.getElementById('optionsContainer') as HTMLElement;
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option-container';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'option-input';
        input.placeholder = 'Enter option';

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-option button secondary';
        removeBtn.textContent = '×';
        removeBtn.style.padding = '4px 8px';

        removeBtn.addEventListener('click', () => {
            optionDiv.remove();
        });

        optionDiv.appendChild(input);
        optionDiv.appendChild(removeBtn);
        optionsContainer.appendChild(optionDiv);

        input.focus();
    }

    private addNewField(): void {
        if (!this.currentForm) return;

        const fieldType = (document.getElementById('fieldType') as HTMLSelectElement).value as FieldType;
        const fieldLabel = (document.getElementById('fieldLabel') as HTMLInputElement).value;

        const newField: IFormField = {
            id: crypto.randomUUID(),
            type: fieldType,
            label: fieldLabel,
            order: this.currentForm.fields.length,
            required: false
        };

        if (fieldType === FieldType.RADIO || fieldType === FieldType.CHECKBOX) {
            const options: IFieldOption[] = [];
            const optionInputs = document.querySelectorAll('.option-input') as NodeListOf<HTMLInputElement>;

            optionInputs.forEach((input, index) => {
                if (input.value.trim()) {
                    options.push({
                        id: crypto.randomUUID(),
                        value: `option_${index + 1}`,
                        label: input.value.trim()
                    });
                }
            });

            newField.options = options;
        }

        this.currentForm.fields.push(newField);
        this.hideAddFieldDialog();
        this.renderFormBuilder();
    }

    private editField(fieldId: string): void {
        if (!this.currentForm) return;

        const field = this.currentForm.fields.find(f => f.id === fieldId);
        if (!field) return;

        const dialog = document.getElementById('fieldTypeDialog') as HTMLElement;
        dialog.style.display = 'block';

        (document.getElementById('fieldType') as HTMLSelectElement).value = field.type;
        (document.getElementById('fieldLabel') as HTMLInputElement).value = field.label;

        if (field.type === FieldType.RADIO || field.type === FieldType.CHECKBOX) {
            const optionsContainer = document.getElementById('optionsContainer') as HTMLElement;
            const addOptionBtn = document.getElementById('addOptionBtn') as HTMLElement;

            optionsContainer.style.display = 'block';
            addOptionBtn.style.display = 'block';
            optionsContainer.innerHTML = '';

            field.options?.forEach(option => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option-container';

                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'option-input';
                input.value = option.label;

                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.className = 'remove-option button secondary';
                removeBtn.textContent = '×';
                removeBtn.addEventListener('click', () => optionDiv.remove());

                optionDiv.appendChild(input);
                optionDiv.appendChild(removeBtn);
                optionsContainer.appendChild(optionDiv);
            });
        }

        const addFieldBtn = document.getElementById('addFieldConfirm');
        if (addFieldBtn) {
            addFieldBtn.textContent = 'Update Field';

            const newAddFieldBtn = addFieldBtn.cloneNode(true);
            addFieldBtn.parentNode?.replaceChild(newAddFieldBtn, addFieldBtn);

            newAddFieldBtn.addEventListener('click', () => {
                this.updateField(fieldId);
                this.hideAddFieldDialog();
            });
        }
    }

    private updateField(fieldId: string): void {
        if (!this.currentForm) return;

        const fieldIndex = this.currentForm.fields.findIndex(f => f.id === fieldId);
        if (fieldIndex === -1) return;

        const fieldType = (document.getElementById('fieldType') as HTMLSelectElement).value as FieldType;
        const fieldLabel = (document.getElementById('fieldLabel') as HTMLInputElement).value;

        const updatedField: IFormField = {
            ...this.currentForm.fields[fieldIndex],
            type: fieldType,
            label: fieldLabel,
        };

        if (fieldType === FieldType.RADIO || fieldType === FieldType.CHECKBOX) {
            const options: IFieldOption[] = [];
            const optionInputs = document.querySelectorAll('.option-input') as NodeListOf<HTMLInputElement>;

            optionInputs.forEach((input, index) => {
                if (input.value.trim()) {
                    options.push({
                        id: crypto.randomUUID(),
                        value: `option_${index + 1}`,
                        label: input.value.trim()
                    });
                }
            });

            updatedField.options = options;
        }

        this.currentForm.fields[fieldIndex] = updatedField;
        this.renderFormBuilder();
    }

    private renderFormBuilder(): void {
        if (!this.currentForm) return;

        const titleInput = document.getElementById('formTitle') as HTMLInputElement;
        if (titleInput && (!titleInput.value || titleInput.value !== this.currentForm.title)) {
            titleInput.value = this.currentForm.title;
        }

        this.fieldListContainer.innerHTML = `
            <div class="fields-container">
                ${this.currentForm.fields
                .sort((a, b) => a.order - b.order)
                .map(field => this.renderFormField(field))
                .join('')}
            </div>
        `;

        this.addFieldEventListeners();
    }

    private addRequiredFieldToggle(field: IFormField): string {
        return `
            <div class="field-options">
                <label class="required-toggle">
                    <input type="checkbox" 
                           data-field-id="${field.id}"
                           class="required-checkbox"
                           ${field.required ? 'checked' : ''} />
                    Required field
                </label>
            </div>
        `;
    }

    private renderFormField(field: IFormField): string {
        let fieldHtml = `
        <div class="field" data-field-id="${field.id}" draggable="true" data-order="${field.order}">
            <div class="field-header">
                <div class="field-label-container" style="flex-grow: 1;">
                    <input type="text" 
                           class="field-label" 
                           value="${field.label}" 
                           placeholder="Question" 
                           disabled
                           data-original-label="${field.label}">
                    <div class="edit-hint" style="display: none; color: #666; font-size: 12px; margin-top: 4px;">
                        Click to edit the question
                    </div>
                </div>
                <div class="field-actions">
                    <button type="button" 
                            class="field-action button secondary edit-field" 
                            title="Click to edit">
                        <span>✎</span> Edit
                    </button>
                    <button type="button" 
                            class="field-action button secondary delete-field" 
                            title="Delete field">
                        Delete
                    </button>
                    <button type="button" 
                            class="field-action button secondary move-up" 
                            title="Move up">↑</button>
                    <button type="button" 
                            class="field-action button secondary move-down" 
                            title="Move down">↓</button>
                </div>
            </div>
            ${this.addRequiredFieldToggle(field)}
        `;

        switch (field.type) {
            case FieldType.TEXT:
                fieldHtml += `<input type="text" class="preview-input" disabled placeholder="Text input field">`;
                break;
            case FieldType.RADIO:
                fieldHtml += `<div class="preview-options">
                    ${field.options?.map(option => `
                        <div class="radio-option">
                            <input type="radio" name="preview_${field.id}" disabled>
                            <label>${option.label}</label>
                        </div>
                    `).join('') || ''}
                </div>`;
                break;
            case FieldType.CHECKBOX:
                fieldHtml += `<div class="preview-options">
                    ${field.options?.map(option => `
                        <div class="checkbox-option">
                            <input type="checkbox" disabled>
                            <label>${option.label}</label>
                        </div>
                    `).join('') || ''}
                </div>`;
                break;
        }

        fieldHtml += '</div>';
        return fieldHtml;
    }

    private toggleRequired(fieldId: string, checked: boolean): void {
        if (!this.currentForm) return;
        const field = this.currentForm.fields.find(f => f.id === fieldId);
        if (field) {
            field.required = checked;
            this.renderFormBuilder();
        }
    }

    private toggleFieldEditMode(fieldElement: HTMLElement, isEditing: boolean): void {
        const labelInput = fieldElement.querySelector('.field-label') as HTMLInputElement;
        const editHint = fieldElement.querySelector('.edit-hint') as HTMLElement;
        const editButton = fieldElement.querySelector('.edit-field') as HTMLButtonElement;

        if (isEditing) {
            labelInput.disabled = false;
            labelInput.focus();
            editHint.style.display = 'block';
            editButton.innerHTML = '<span>✓</span> Save';
            editButton.classList.add('editing');
        } else {
            labelInput.disabled = true;
            editHint.style.display = 'none';
            editButton.innerHTML = '<span>✎</span> Edit';
            editButton.classList.remove('editing');
        }
    }

    private addFieldEventListeners(): void {
        document.querySelectorAll('.edit-field').forEach(button => {
            button.addEventListener('click', (e) => {
                const fieldElement = (e.target as HTMLElement).closest('.field') as HTMLElement;
                const editButton = e.target as HTMLElement;
                const isEditing = editButton.classList.contains('editing');

                if (isEditing) {
                    const fieldId = fieldElement.getAttribute('data-field-id');
                    const labelInput = fieldElement.querySelector('.field-label') as HTMLInputElement;
                    if (fieldId && this.currentForm) {
                        const field = this.currentForm.fields.find(f => f.id === fieldId);
                        if (field) {
                            field.label = labelInput.value;
                        }
                    }
                    this.toggleFieldEditMode(fieldElement, false);
                } else {
                    this.toggleFieldEditMode(fieldElement, true);
                }
            });
        });

        document.querySelectorAll('.delete-field').forEach(button => {
            button.addEventListener('click', (e) => {
                const fieldElement = (e.target as HTMLElement).closest('.field');
                if (fieldElement) {
                    const fieldId = fieldElement.getAttribute('data-field-id');
                    this.deleteField(fieldId!);
                }
            });
        });

        document.querySelectorAll('.move-up, .move-down').forEach(button => {
            button.addEventListener('click', (e) => {
                const direction = (e.target as HTMLElement).classList.contains('move-up') ? 'up' : 'down';
                const fieldElement = (e.target as HTMLElement).closest('.field');
                if (fieldElement) {
                    const fieldId = fieldElement.getAttribute('data-field-id');
                    this.moveField(fieldId!, direction);
                }
            });
        });

        document.querySelectorAll('.required-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const target = e.target as HTMLInputElement;
                const fieldId = target.getAttribute('data-field-id');
                if (fieldId) {
                    this.toggleRequired(fieldId, target.checked);
                }
            });
        });
    }

    private deleteField(fieldId: string): void {
        if (!this.currentForm) return;

        this.currentForm.fields = this.currentForm.fields.filter(field => field.id !== fieldId);
        this.renderFormBuilder();
    }

    private moveField(fieldId: string, direction: 'up' | 'down'): void {
        if (!this.currentForm) return;

        const currentIndex = this.currentForm.fields.findIndex(field => field.id === fieldId);
        if (currentIndex === -1) return;

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= this.currentForm.fields.length) return;

        const temp = this.currentForm.fields[currentIndex].order;
        this.currentForm.fields[currentIndex].order = this.currentForm.fields[newIndex].order;
        this.currentForm.fields[newIndex].order = temp;

        this.renderFormBuilder();
    }

    private saveForm(): void {
        if (!this.currentForm) return;

        const titleInput = document.getElementById('formTitle') as HTMLInputElement;
        this.currentForm.title = titleInput.value;
        this.currentForm.updatedAt = new Date().toISOString();

        document.querySelectorAll('.field').forEach(fieldElement => {
            const fieldId = fieldElement.getAttribute('data-field-id');
            const labelInput = fieldElement.querySelector('.field-label') as HTMLInputElement;
            const field = this.currentForm!.fields.find(f => f.id === fieldId);
            if (field && labelInput) {
                field.label = labelInput.value;
            }
        });

        this.storageService.saveForm(this.currentForm);
        alert('Form saved successfully!');
    }

    private renderOptionCustomization(option: IFieldOption, fieldId: string): string {
        return `
        <div class="option-item" data-option-id="${option.id}">
            <input type="text" 
                   class="option-input" 
                   value="${option.label}" 
                   placeholder="Option text">
            <button type="button" class="delete-option">×</button>
        </div>
    `;
    }

    private updateOption(fieldId: string, optionId: string, newLabel: string): void {
        if (!this.currentForm) return;
        const field = this.currentForm.fields.find(f => f.id === fieldId);
        if (field && field.options) {
            const option = field.options.find(o => o.id === optionId);
            if (option) {
                option.label = newLabel;
            }
        }
    }

    private initializeDragAndDrop(): void {
        document.addEventListener('dragstart', (e: Event) => {
            const dragEvent = e as DragEvent;
            const target = dragEvent.target as HTMLElement;
            const draggedField = target.closest('.field');
            if (draggedField) {
                draggedField.classList.add('dragging');
            }
        });

        document.addEventListener('dragend', (e: Event) => {
            const dragEvent = e as DragEvent;
            const draggedField = document.querySelector('.dragging');
            if (draggedField) {
                draggedField.classList.remove('dragging');
                this.updateFieldOrder();
            }
        });

        document.addEventListener('dragover', (e: Event) => {
            const dragEvent = e as DragEvent;
            dragEvent.preventDefault();
            const fieldsContainer = document.querySelector('.fields-container');
            if (!fieldsContainer) return;

            const afterElement = this.getDragAfterElement(fieldsContainer as HTMLElement, dragEvent.clientY);
            const draggable = document.querySelector('.dragging');
            if (draggable) {
                if (afterElement == null) {
                    fieldsContainer.appendChild(draggable);
                } else {
                    fieldsContainer.insertBefore(draggable, afterElement);
                }
            }
        });
    }

    private getDragAfterElement(container: HTMLElement, y: number): Element | null {
        const draggableElements = [...container.querySelectorAll('.field:not(.dragging)')];

        return draggableElements.reduce<Element | null>((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > (closest?.getBoundingClientRect().top ?? Number.NEGATIVE_INFINITY)) {
                return child;
            } else {
                return closest;
            }
        }, null);
    }

    private updateFieldOrder(): void {
        if (!this.currentForm) return;

        const fields = document.querySelectorAll('.field');
        fields.forEach((field, index) => {
            const fieldId = field.getAttribute('data-field-id');
            if (fieldId) {
                const formField = this.currentForm!.fields.find(f => f.id === fieldId);
                if (formField) {
                    formField.order = index;
                }
            }
        });

        this.saveForm();
    }
}