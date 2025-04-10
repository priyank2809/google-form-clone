export class StorageService {
    constructor() {
        this.FORMS_KEY = 'forms';
        this.RESPONSES_KEY = 'form_responses';
    }
    saveForm(form) {
        const forms = this.getForms();
        const existingFormIndex = forms.findIndex(f => f.id === form.id);
        if (existingFormIndex >= 0) {
            forms[existingFormIndex] = form;
        }
        else {
            forms.push(form);
        }
        localStorage.setItem(this.FORMS_KEY, JSON.stringify(forms));
    }
    getForms() {
        const formsJson = localStorage.getItem(this.FORMS_KEY);
        return formsJson ? JSON.parse(formsJson) : [];
    }
    getFormById(id) {
        const forms = this.getForms();
        return forms.find(form => form.id === id) || null;
    }
    deleteForm(id) {
        const forms = this.getForms().filter(form => form.id !== id);
        localStorage.setItem(this.FORMS_KEY, JSON.stringify(forms));
        this.deleteFormResponses(id);
    }
    saveFormResponse(response) {
        const responses = this.getFormResponses(response.formId);
        responses.push(response);
        localStorage.setItem(`${this.RESPONSES_KEY}_${response.formId}`, JSON.stringify(responses));
    }
    getFormResponses(formId) {
        const responsesJson = localStorage.getItem(`${this.RESPONSES_KEY}_${formId}`);
        return responsesJson ? JSON.parse(responsesJson) : [];
    }
    deleteFormResponses(formId) {
        localStorage.removeItem(`${this.RESPONSES_KEY}_${formId}`);
    }
}
