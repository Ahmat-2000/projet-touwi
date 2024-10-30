// services/api/validationService.js

export function validateFields(body, fieldValidations) {
    const errors = fieldValidations.reduce((acc, { field, required, type }) => {
        if (required && !body[field]) {
            acc.push({ field, message: `The field ${field} is required.` });
        } else if (type && typeof body[field] !== type) {
            acc.push({ field, message: `The field ${field} must by of type ${type}.` });
        }
        return acc;
    }, []);
    return errors;
}