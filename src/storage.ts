import { IForm, IFormResponse } from './types.js';

export class StorageService {
    private readonly FORMS_KEY = 'forms';
    private readonly RESPONSES_KEY = 'form_responses';

    public saveForm(form: IForm): void {
        const forms = this.getForms();
        const existingFormIndex = forms.findIndex(f => f.id === form.id);
        
        if (existingFormIndex >= 0) {
            forms[existingFormIndex] = form;
        } else {
            forms.push(form);
        }
        
        localStorage.setItem(this.FORMS_KEY, JSON.stringify(forms));
    }

    public getForms(): IForm[] {
        const formsJson = localStorage.getItem(this.FORMS_KEY);
        return formsJson ? JSON.parse(formsJson) : [];
    }

    public getFormById(id: string): IForm | null {
        const forms = this.getForms();
        return forms.find(form => form.id === id) || null;
    }

    public deleteForm(id: string): void {
        const forms = this.getForms().filter(form => form.id !== id);
        localStorage.setItem(this.FORMS_KEY, JSON.stringify(forms));
        this.deleteFormResponses(id);
    }

    public saveFormResponse(response: IFormResponse): void {
        const responses = this.getFormResponses(response.formId);
        responses.push(response);
        localStorage.setItem(
            `${this.RESPONSES_KEY}_${response.formId}`,
            JSON.stringify(responses)
        );
    }

    public getFormResponses(formId: string): IFormResponse[] {
        const responsesJson = localStorage.getItem(`${this.RESPONSES_KEY}_${formId}`);
        return responsesJson ? JSON.parse(responsesJson) : [];
    }

    private deleteFormResponses(formId: string): void {
        localStorage.removeItem(`${this.RESPONSES_KEY}_${formId}`);
    }
}