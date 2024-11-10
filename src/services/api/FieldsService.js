// services/api/validationService.js

export function validateFields(body, fieldValidations, method) {
    const errors = fieldValidations.reduce((acc, { field, required, type, applyTo }) => {

        // Vérify if the field is applicable to the method
        if (applyTo && !applyTo.includes(method)) return acc;

        // Vérify if the field is required and exists
        if (method === 'POST' && required && !body.hasOwnProperty(field)) {
            acc.push({ field, message: `The field "${field}" is required.` });
            return acc;
        }

        // Vérify if the field type is correct
        if (body[field] !== undefined && type && typeof body[field] !== type) {
            acc.push({ field, message: `The field "${field}" must be of type "${type}".` });
        }

        return acc;
    }, []);

    return errors;
}

export function formatBody(body, fieldValidations) {
    const newBody = {};

    fieldValidations.forEach(({ field, prismaConnect }) => {
        if (!body.hasOwnProperty(field)) return;
        
        if (prismaConnect)
            newBody[prismaConnect] = { connect: { id: body[field] } };
        else
            newBody[field] = body[field];
    });

    return newBody;
}