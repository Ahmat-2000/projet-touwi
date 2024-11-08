// services/api/GenericController.js
import { ChronosResponse } from '@/utils/api/ChronosResponse';
import { validateFields } from '@/services/api/ValidationService';

export class GenericController {
    constructor(prismaModel, DTO, fieldValidations) {
        this.prismaModel = prismaModel;
        this.DTO = DTO;
        this.fieldValidations = fieldValidations;
    }

    async getAll() {
        try {
            const items = await this.prismaModel.findMany();
            return new ChronosResponse(200, { data:items, DTO:this.DTO });
        } catch (error) {
            console.error(error);
            return new ChronosResponse(500, { message:'Error retrieving data.' });
        }
    }

    async getById(params) {
        try {
            const { id } = params;

            if (!id) return new ChronosResponse(400, { message:'Id is required.' });

            const item = await this.prismaModel.findUnique({ where: { id: parseInt(id) } });

            if (!item) return new ChronosResponse(404, { message:'Element not found.' });

            return new ChronosResponse(200, { data:item, DTO:this.DTO });
        } catch (error) {
            console.error(error);
            return new ChronosResponse(500, { message:'Error retrieving data.' });
        }
    }

    async create(request) {
        try {
            const body = await request.json();

            if (!body) return new ChronosResponse(400, { message:'Body is required.' });

            // Validation of required fields
            const errors = this.fieldValidations ? validateFields(body, this.fieldValidations, "POST") : [];
            if (errors.length > 0) return new ChronosResponse(400, { errors:errors });

            // Create the element
            const item = await this.prismaModel.create({ data: body });

            return new ChronosResponse(201, { data:item, DTO:this.DTO });
        } catch (error) {
            console.error(error);
            return new ChronosResponse(500, { message:'Error creating the element.' });
        }
    }

    async update(request, params) {
        try {
            const { id } = params;
            const body = await request.json();

            if (!id) return new ChronosResponse(400, { message:'Id is required.' });

            if (!body) return new ChronosResponse(400, { message:'Body is required.' });

            // Validation of required fields
            const errors = this.fieldValidations ? validateFields(body, this.fieldValidations, "PUT") : [];
            if (errors.length > 0) return new ChronosResponse(400, { errors:errors });

            // Update the element
            const item = await this.prismaModel.update({
                where: { id: parseInt(id) },
                data: body,
            });

            return new ChronosResponse(200, { data:item, DTO:this.DTO });
        } catch (error) {
            console.error(error);
            return new ChronosResponse(500, { message:'Error updating the element.' });
        }
    }

    async delete(params) {
        try {
            
            const { id } = params;

            if (!id) return new ChronosResponse(400, { message:'Id is required.' });

            // Ensure id is a valid integer
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
