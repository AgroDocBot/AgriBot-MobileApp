import type { FieldData, FieldType, MeasurementType } from "./FieldInterfaces";

interface AddMeasurementPopupProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (measurementData: {fieldId: number}) => void;
    userId: number;
    initialField: FieldType,
    mode: "add" | "edit",
    currentField : String
}

interface MenuProps {
    activeTab: string,
    setActiveTab: (tab: string) => void,
}

interface AddFieldPopupProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (field: FieldData) => void;
    initialValues: FieldType,
    mode: "add" | "edit"
}

interface CardProps {
    data: any,
    activeTab: 'fields' | 'measurements' | "diseases";
    onEdit: (data: any, field: FieldType) => void;
    onRemove: (data: any) => void;
    fields: Array<FieldType>;
    measurements: Array<MeasurementType>
}

interface CardPropsData {
    
}

export { AddMeasurementPopupProps, MenuProps, AddFieldPopupProps, CardProps }