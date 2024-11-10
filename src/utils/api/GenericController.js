// services/api/GenericController.js
import { ChronosResponse } from '@/utils/api/ChronosResponse';
import { validateFields, formatBody } from '@/services/api/FieldsService';
import { checkPermissions } from '@/services/api/permissionService';


// On the create and update methods, we need the body and if we take it with
// request.json() we will not be able to get the cookies and urls from it anymore
// that's why we use the handleRequest method to clone the request and extract the body from it.

export class GenericController {
    constructor(prismaModel, DTO, fieldValidations) {
        this.prismaModel = prismaModel;
        this.DTO = DTO;
        this.fieldValidations = fieldValidations;
    }

    async getAll(request) {
        try {
            const permission = checkPermissions(request);
            if (!permission) return permission;

            const items = await this.prismaModel.findMany();
            return new ChronosResponse(200, { data:items, DTO:this.DTO });
        } catch (error) {
            console.error(error);
            return new ChronosResponse(500, { message:'Error retrieving data.' });
        }
    }

    async getById(request, params) {
        try {
            const permission = checkPermissions(request);
            if (!permission) return permission;

            const { id } = params;

            if (!id) return new ChronosResponse(400, { message:'Id is required.' });

            const parsedId = parseInt(id);
            if (isNaN(parsedId)) return new ChronosResponse(400, { message:'Id must be an integer.' });

            const item = await this.prismaModel.findUnique({ where: { id: parsedId } });

            if (!item) return new ChronosResponse(404, { message:'Element not found.' });

            return new ChronosResponse(200, { data:item, DTO:this.DTO });
        } catch (error) {
            console.error(error);
            return new ChronosResponse(500, { message:'Error retrieving data.' });
        }
    }

    async create(request, body) {
        try {
            const permission = checkPermissions(request);
            if (!permission) return permission;

            if (!body) return new ChronosResponse(400, { message:'Body is required.' });

            // Validation of required fields
            const errors = this.fieldValidations ? validateFields(body, this.fieldValidations, "POST") : [];
            if (errors.length > 0) return new ChronosResponse(400, { errors:errors, message:'One or more fields are invalid.' });

            // Format the body for prisma to understand it
            const prismaBody = formatBody(body, this.fieldValidations);

            // Create the element
            const item = await this.prismaModel.create({ data: prismaBody });

            return new ChronosResponse(201, { data:item, DTO:this.DTO });
        } catch (error) {
            console.error(error);
            return new ChronosResponse(500, { message:'Error creating the element.' });
        }
    }

    async update(request, params, body) {
        try {
            const permission = checkPermissions(request);
            if (!permission) return permission;

            const { id } = params;

            if (!id) return new ChronosResponse(400, { message:'Id is required.' });

            const parsedId = parseInt(id);
            if (isNaN(parsedId)) return new ChronosResponse(400, { message:'Id must be an integer.' });

            if (!body) return new ChronosResponse(400, { message:'Body is required.' });

            // Validation of required fields
            const errors = this.fieldValidations ? validateFields(body, this.fieldValidations, "PUT") : [];
            if (errors.length > 0) return new ChronosResponse(400, { errors:errors, message:'One or more fields are invalid.' });

            // Format the body for prisma to understand it
            const prismaBody = formatBody(body, this.fieldValidations);

            // Update the element
            const item = await this.prismaModel.update({
                where: { id: parsedId },
                data: prismaBody,
            });

            return new ChronosResponse(200, { data:item, DTO:this.DTO });
        } catch (error) {
            console.error(error);
            return new ChronosResponse(500, { message:'Error updating the element.' });
        }
    }

    async delete(request, params) {
        try {
            const permission = checkPermissions(request);
            if (!permission) return permission;
            
            const { id } = params;

            if (!id) return new ChronosResponse(400, { message:'Id is required.' });

            const parsedId = parseInt(id);
            if (isNaN(parsedId)) return new ChronosResponse(400, { message:'Id must be an integer.' });

            // Element not found
            const item = await this.prismaModel.findUnique({ where: { id: parsedId } });
            if (!item) return new ChronosResponse(404, { message:'Element not found.' });

            // Delete the element
            await this.prismaModel.delete({ where: { id: parsedId } });
            return new ChronosResponse(200, { data:item, DTO:this.DTO });
        } catch (error) {
            console.error(error);
            return new ChronosResponse(500, { message:'Error deleting the element.' });
        }
    }
}
