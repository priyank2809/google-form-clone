import { FormBuilder } from './formBuilder.js';
import { StorageService } from './storage.js';
import { FieldType } from './types.js';
class FormApp {
    constructor() {
        this.formBuilder = new FormBuilder();
        this.storageService = new StorageService();
        this.formListContainer = document.getElementById('formList');
        this.formBuilderContainer = document.getElementById('formBuilder');
        this.formPreviewContainer = document.getElementById('formPreview');
        this.responsesContainer = document.getElementById('responsesView');
        this.initialize();
    }
    initialize() {
        this.showFormList();
        this.setupEventListeners();
    }
    setupEventListeners() {
        const newFormBtn = document.getElementById('newFormBtn');
        if (newFormBtn) {
            newFormBtn.addEventListener('click', () => this.createNewForm());
        }
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target.matches('.back-to-forms, .back-to-forms *')) {
                e.preventDefault();
                this.showFormList();
                return;
            }
            if (target.matches('[data-action="edit-form"]')) {
                const formId = target.getAttribute('data-form-id');
                if (formId)
                    this.editForm(formId);
            }
            else if (target.matches('[data-action="preview-form"]')) {
                const formId = target.getAttribute('data-form-id');
                if (formId)
                    this.previewForm(formId);
            }
            else if (target.matches('[data-action="delete-form"]')) {
                const formId = target.getAttribute('data-form-id');
                if (formId)
                    this.deleteForm(formId);
            }
            else if (target.matches('[data-action="view-responses"]')) {
                const formId = target.getAttribute('data-form-id');
                if (formId)
                    this.viewResponses(formId);
            }
            else if (target.matches('[data-action="export-data"]')) {
                const formId = target.getAttribute('data-form-id');
                if (formId)
                    this.exportFormData(formId);
            }
        });
        document.addEventListener('submit', (e) => {
            const target = e.target;
            if (target.matches('#previewFormElement')) {
                e.preventDefault();
                this.handleFormSubmission(e.target);
            }
        });
    }
    showFormList() {
        this.formBuilderContainer.style.display = 'none';
        this.formPreviewContainer.style.display = 'none';
        this.responsesContainer.style.display = 'none';
        this.formListContainer.style.display = 'block';
        const forms = this.storageService.getForms();
        this.formListContainer.innerHTML = `
            <div class="container">
                <div class="header">
                    <h1>Your Forms</h1>
                    <button id="newFormBtn" class="button primary">Create New Form</button>
                </div>
                <div class="forms-grid">
                    ${forms.map(form => this.renderFormCard(form)).join('')}
                </div>
            </div>
        `;
        const newFormBtn = document.getElementById('newFormBtn');
        if (newFormBtn) {
            newFormBtn.addEventListener('click', () => this.createNewForm());
        }
    }
    exportFormData(formId) {
        const form = this.storageService.getFormById(formId);
        const responses = this.storageService.getFormResponses(formId);
        const exportData = {
            form,
            responses,
            exportDate: new Date().toISOString()
        };
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `form_${form?.title || 'untitled'}_export.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
    renderFormCard(form) {
        const responseCount = this.storageService.getFormResponses(form.id).length;
        return `
            <div class="form-card">
                <div class="form-card-header">
                    <h3>${form.title || 'Untitled Form'}</h3>
                    <span class="response-count">${responseCount} responses</span>
                </div>
                <div class="form-card-body">
                    <p class="created-date">Created: ${new Date(form.createdAt).toLocaleDateString()}</p>
                    <p class="updated-date">Updated: ${new Date(form.updatedAt).toLocaleDateString()}</p>
                </div>
                <div class="form-card-actions">
                    <button data-action="edit-form" data-form-id="${form.id}" class="button">
                        Edit
                    </button>
                    <button data-action="preview-form" data-form-id="${form.id}" class="button">
                        Preview
                    </button>
                    <button data-action="view-responses" data-form-id="${form.id}" class="button">
                        Responses
                    </button>
                    <button data-action="delete-form" data-form-id="${form.id}" class="button danger">
                        Delete
                    </button>
                    <button data-action="export-data" data-form-id="${form.id}" class="button">
                        Export Data
                    </button>
                </div>
            </div>
        `;
    }
    createNewForm() {
        this.formListContainer.style.display = 'none';
        this.formBuilderContainer.style.display = 'block';
        this.formBuilder.createNewForm();
    }
    editForm(formId) {
        this.formListContainer.style.display = 'none';
        this.formBuilderContainer.style.display = 'block';
        this.formBuilder.loadForm(formId);
    }
    async previewForm(formId) {
        const form = this.storageService.getFormById(formId);
        if (!form)
            return;
        this.formListContainer.style.display = 'none';
        this.formBuilderContainer.style.display = 'none';
        this.formPreviewContainer.style.display = 'block';
        this.formPreviewContainer.innerHTML = `
            <div class="container">
                <div class="header">
                    <h1>${form.title}</h1>
                    <button class="back-to-forms button">Back to Forms</button>
                </div>
                <form id="previewFormElement">
                    <input type="hidden" name="formId" value="${form.id}">
                    ${form.fields.map(field => this.renderPreviewField(field)).join('')}
                    <button type="submit" class="button primary">Submit</button>
                </form>
            </div>
        `;
    }
    renderPreviewField(field) {
        switch (field.type) {
            case 'text':
                return `
                    <div class="form-field">
                        <label for="${field.id}">${field.label}</label>
                        <input type="text" id="${field.id}" name="${field.id}" 
                               ${field.required ? 'required' : ''}>
                    </div>
                `;
            case 'radio':
                return `
                    <div class="form-field">
                        <label>${field.label}</label>
                        ${field.options?.map((option) => `
                            <div class="radio-option">
                                <input type="radio" id="${option.id}" name="${field.id}" 
                                       value="${option.value}" ${field.required ? 'required' : ''}>
                                <label for="${option.id}">${option.label}</label>
                            </div>
                        `).join('')}
                    </div>
                `;
            case 'checkbox':
                return `
                    <div class="form-field">
                        <label>${field.label}</label>
                        ${field.options?.map((option) => `
                            <div class="checkbox-option">
                                <input type="checkbox" id="${option.id}" name="${field.id}" 
                                       value="${option.value}">
                                <label for="${option.id}">${option.label}</label>
                            </div>
                        `).join('')}
                    </div>
                `;
            default:
                return '';
        }
    }
    async handleFormSubmission(form) {
        const formData = new FormData(form);
        const formId = formData.get('formId');
        const response = {
            id: crypto.randomUUID(),
            formId: formId,
            responses: [],
            submittedAt: new Date().toISOString()
        };
        for (const [key, value] of formData.entries()) {
            if (key === 'formId')
                continue;
            if (formData.getAll(key).length > 1) {
                response.responses.push({
                    fieldId: key,
                    value: formData.getAll(key).map(val => val.toString())
                });
            }
            else {
                response.responses.push({
                    fieldId: key,
                    value: value.toString()
                });
            }
        }
        this.storageService.saveFormResponse(response);
        alert('Form submitted successfully!');
        this.showFormList();
    }
    deleteForm(formId) {
        if (confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
            this.storageService.deleteForm(formId);
            this.showFormList();
        }
    }
    viewResponses(formId) {
        const form = this.storageService.getFormById(formId);
        const responses = this.storageService.getFormResponses(formId);
        if (!form)
            return;
        this.formListContainer.style.display = 'none';
        this.responsesContainer.style.display = 'block';
        this.responsesContainer.innerHTML = `
            <div class="container">
                <div class="header">
                    <h1>Responses: ${form.title}</h1>
                    <button class="back-to-forms button">Back to Forms</button>
                </div>
                ${this.renderResponsesTable(form, responses)}
            </div>
        `;
    }
    renderResponsesTable(form, responses) {
        if (responses.length === 0) {
            return '<p>No responses yet.</p>';
        }
        return `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Submission Date</th>
                            ${form.fields.map(field => `<th>${field.label}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${responses.map(response => `
                            <tr>
                                <td>${new Date(response.submittedAt).toLocaleString()}</td>
                                ${form.fields.map(field => {
            const fieldResponse = response.responses.find(r => r.fieldId === field.id);
            if (!fieldResponse)
                return '<td></td>';
            if (field.options && (field.type === FieldType.RADIO || field.type === FieldType.CHECKBOX)) {
                if (Array.isArray(fieldResponse.value)) {
                    const selectedLabels = fieldResponse.value.map(value => {
                        const option = field.options?.find(opt => opt.value === value);
                        return option ? option.label : value;
                    });
                    return `<td>${selectedLabels.join(', ')}</td>`;
                }
                else {
                    const option = field.options.find(opt => opt.value === fieldResponse.value);
                    return `<td>${option ? option.label : fieldResponse.value}</td>`;
                }
            }
            return `<td>${fieldResponse.value}</td>`;
        }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    generateAnalytics(formId) {
        const form = this.storageService.getFormById(formId);
        const responses = this.storageService.getFormResponses(formId);
        if (!form || !responses.length)
            return '<p>No responses yet</p>';
        let analyticsHtml = '<div class="analytics-container">';
        form.fields.forEach(field => {
            analyticsHtml += `<div class="field-analytics">
                <h3>${field.label}</h3>`;
            if (field.type === FieldType.RADIO || field.type === FieldType.CHECKBOX) {
                const optionCounts = new Map();
                responses.forEach(response => {
                    const fieldResponse = response.responses.find(r => r.fieldId === field.id);
                    if (fieldResponse) {
                        const values = Array.isArray(fieldResponse.value)
                            ? fieldResponse.value
                            : [fieldResponse.value];
                        values.forEach(value => {
                            optionCounts.set(value, (optionCounts.get(value) || 0) + 1);
                        });
                    }
                });
                analyticsHtml += `<div class="option-stats">
                    ${Array.from(optionCounts.entries()).map(([option, count]) => `
                        <div class="stat-item">
                            <span>${option}: ${count} responses</span>
                            <div class="stat-bar" style="width: ${(count / responses.length) * 100}%"></div>
                        </div>
                    `).join('')}
                </div>`;
            }
            else {
                const responseCount = responses.filter(r => r.responses.some(resp => resp.fieldId === field.id)).length;
                analyticsHtml += `<p>${responseCount} responses</p>`;
            }
            analyticsHtml += '</div>';
        });
        analyticsHtml += '</div>';
        return analyticsHtml;
    }
    viewAnalytics(formId) {
        const form = this.storageService.getFormById(formId);
        if (!form)
            return;
        this.formListContainer.style.display = 'none';
        this.formBuilderContainer.style.display = 'none';
        this.formPreviewContainer.innerHTML = `
        <div class="container">
            <div class="header">
                <h1>Analytics: ${form.title}</h1>
                <button class="back-to-forms button">Back to Forms</button>
            </div>
            ${this.generateAnalytics(formId)}
        </div>
    `;
        this.formPreviewContainer.style.display = 'block';
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new FormApp();
});
export default FormApp;
