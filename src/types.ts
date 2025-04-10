export enum FieldType {
    TEXT = 'text',
    RADIO = 'radio',
    CHECKBOX = 'checkbox'
}

export interface IFieldOption {
    id: string;
    value: string;
    label: string;
}

export interface IFormField {
    id: string;
    type: FieldType;
    label: string;
    order: number;
    options?: IFieldOption[];
    required: boolean;
}

export interface IForm {
    id: string;
    title: string;
    description?: string;
    fields: IFormField[];
    createdAt: string;
    updatedAt: string;
}

export interface IFormResponse {
    id: string;
    formId: string;
    responses: {
        fieldId: string;
        value: string | string[];
    }[];
    submittedAt: string;
}

export interface DragPosition {
    offset: number;
    element: Element | null;
}