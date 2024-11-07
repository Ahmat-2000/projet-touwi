import { NextResponse } from 'next/server';

export class ChronosResponse {
    constructor(status, message=null, data = null, error = null) {
        this.status = status;
        this.data = data;
        this.message = message;
        this.error = error;
    }
    
    generateResponse() {
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