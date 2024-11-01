// services/api/validationService.js

export function validateFields(body, fieldValidations, method) {
    const errors = fieldValidations.reduce((acc, { field, required, type }) => {
        
        // Verify if the field is aplied to the method
        const applyTo = fieldValidations.find(fv => fv.field === field).applyTo;
        if (!applyTo.includes(method)) return acc;

        console.log('field', field);
        console.log('required', required);
        console.log('type', type);
        console.log('method', method);
        console.log('body[field]', body[field]);
        console.log('typeof body[field]', typeof body[field]);

        // Else, validate the field
        if (required && !body[field]) {
            acc.push({ field, message: `The field ${field} is required.` });
        } else if (type && typeof body[field] !== type) {
            acc.push({ field, message: `The field ${field} must by of type ${type}.` });
        }
        return acc;
    }, []);
    return errors;
}