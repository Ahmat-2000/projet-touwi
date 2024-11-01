// services/api/GenericController.js
import { NextResponse } from 'next/server';
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
            return NextResponse.json(result, { status: 200 });
        } catch (error) {
            console.error(error);
            return NextResponse.json({ message: 'Error retrieving data.' }, { status: 500 });
        }
    }

    async getById(params) {
        try {
            const { id } = params;

            if (!id) return NextResponse.json({ message: 'Id is required.' }, { status: 400 });

            const item = await this.prismaModel.findUnique({ where: { id: parseInt(id) } });

            if (!item) return NextResponse.json({ message: 'Element not found.' }, { status: 404 });

            const result = this.DTO ? new this.DTO(item) : item;
            return NextResponse.json(result, { status: 200 });
        } catch (error) {
            console.error(error);
            return NextResponse.json({ message: 'Error retrieving the element.' }, { status: 500 });
        }
    }

    async create(request) {
        try {
            const body = await request.json();

            if (!body) return NextResponse.json({ message: 'Body is required.' }, { status: 400 });

            // Validation of required fields
            const errors = this.fieldValidations ? validateFields(body, this.fieldValidations, "POST") : [];
            if (errors.length > 0) return NextResponse.json({ errors }, { status: 400 });

            // Create the element
            const item = await this.prismaModel.create({ data: body });

            // Format the response with the DTO
            const result = this.DTO ? new this.DTO(item) : item;
            return NextResponse.json(result, { status: 201 });
        } catch (error) {
            console.error(error);
            return NextResponse.json({ message: 'Error creating the element.' }, { status: 500 });
        }
    }

    async update(request, params) {
        try {
            const { id } = params;
            const body = await request.json();

            if (!id) return NextResponse.json({ message: 'Id is required.' }, { status: 400 });

            if (!body) return NextResponse.json({ message: 'Body is required.' }, { status: 400 });

            // Validation of required fields
            const errors = this.fieldValidations ? validateFields(body, this.fieldValidations, "PUT") : [];
            if (errors.length > 0) return NextResponse.json({ errors }, { status: 400 });

            // Update the element
            const item = await this.prismaModel.update({
                where: { id: parseInt(id) },
                data: body,
            });

            // Format the response with the DTO
            const result = this.DTO ? new this.DTO(item) : item;
            return NextResponse.json(result, { status: 200 });
        } catch (error) {
            console.error(error);
            return NextResponse.json({ message: 'Error updating the element.' }, { status: 500 });
        }
    }

    async delete(params) {
        try {
            const { id } = params;

            if (!id) return NextResponse.json({ message: 'Id is required.' }, { status: 400 });

            // Element not found
            const item = await this.prismaModel.findUnique({ where: { id: parseInt(id) } });
            if (!item) return NextResponse.json({ message: 'Element not found.' }, { status: 404 });

            // Delete the element
            await this.prismaModel.delete({ where: { id: parseInt(id) } });
            return NextResponse.json({ message: 'Element deleted.' }, { status: 200 });
        } catch (error) {
            console.error(error);
            return NextResponse.json({ message: 'Error deleting the element.' }, { status: 500 });
        }
    }
}
