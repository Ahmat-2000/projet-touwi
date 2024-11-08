import { NextResponse } from 'next/server';

export class ChronosResponse {
    constructor(status, { message=null, data = null, error = null, DTO=null }) {
        this.status = status;
        this.data = data;
        this.message = message;
        this.error = error;
        this.DTO = DTO;
    }
    
    generateNextResponse() {
        // Format the data with the DTO before sending the response to the user
        if (Array.isArray(this.data)) { this.data = this.data.map(item => this.DTO ? new this.DTO(item) : item); }
        else { this.data = this.DTO ? new this.DTO(this.data) : this.data; }

        const responseObject = {
            ...(this.message && { message: this.message }),
            ...(this.data && { data: this.data }),
            ...(this.error && { error: this.error })
        };
    
        return NextResponse.json(responseObject, { status: this.status });
    }

    isSuccessful() {
        return this.status >= 200 && this.status < 300;
    }

    isClientError() {
        return this.status >= 400 && this.status < 500;
    }

    isServerError() {
        return this.status >= 500 && this.status < 600;
    }
}