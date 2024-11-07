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
            const result = this.DTO ? items.map(item => new this.DTO(item)) : items;
            return new ChronosResponse(200, null, result);
        } catch (error) {
            console.error(error);
            return new ChronosResponse(500, 'Error retrieving data.');
        }
    }

    async getById(params) {
        try {
            const { id } = params;

            if (!id) return new ChronosResponse(400, 'Id is required.');

            const item = await this.prismaModel.findUnique({ where: { id: parseInt(id) } });

            if (!item) return new ChronosResponse(404, 'Element not found.');

            const result = this.DTO ? new this.DTO(item) : item;
            return new ChronosResponse(200, null, result);
        } catch (error) {
            console.error(error);
            return new ChronosResponse(500, 'Error retrieving data.');
        }
    }

    async create(request) {
        try {
            const body = await request.json();

            if (!body) return new ChronosResponse(400, 'Body is required.');

            // Validation of required fields
            const errors = this.fieldValidations ? validateFields(body, this.fieldValidations, "POST") : [];
            if (errors.length > 0) return new ChronosResponse(400, null, errors);

            // Create the element
            const item = await this.prismaModel.create({ data: body });

            // Format the response with the DTO
            const result = this.DTO ? new this.DTO(item) : item;
            return new ChronosResponse(201, null, result);
        } catch (error) {
            console.error(error);
            return new ChronosResponse(500, 'Error creating the element.');
        }
    }

    async update(request, params) {
        try {
            const { id } = params;
            const body = await request.json();

            if (!id) return new ChronosResponse(400, 'Id is required.');

            if (!body) return new ChronosResponse(400, 'Body is required.');

            // Validation of required fields
            const errors = this.fieldValidations ? validateFields(body, this.fieldValidations, "PUT") : [];
            if (errors.length > 0) return new ChronosResponse(400, null, errors);

            // Update the element
            const item = await this.prismaModel.update({
                where: { id: parseInt(id) },
                data: body,
            });

            // Format the response with the DTO
            const result = this.DTO ? new this.DTO(item) : item;
            return new ChronosResponse(200, null, result);
        } catch (error) {
            console.error(error);
            return new ChronosResponse(500, 'Error updating the element.');
        }
    }

    async delete(params) {
        try {
            
            const { id } = params;

            if (!id) return new ChronosResponse(400, 'Id is required.');

            // Ensure id is a valid integer
            const parsedId = parseInt(id);
            if (isNaN(parsedId)) return new ChronosResponse(400, 'Invalid id.');

            // Element not found
            const item = await this.prismaModel.findUnique({ where: { id: parsedId } });
            if (!item) return new ChronosResponse(404, 'Element not found.');

            // Delete the element
            await this.prismaModel.delete({ where: { id: parsedId } });
            const result = this.DTO ? new this.DTO(item) : item;
            return new ChronosResponse(200, null, result);
        } catch (error) {
            console.error(error);
            return new ChronosResponse(500, 'Error deleting the element.');
        }
    }
}
