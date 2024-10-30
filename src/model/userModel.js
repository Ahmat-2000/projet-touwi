
// Purpose: DTO for user model.
// We use DTOs to hide some fields from the client in the response.
export class UserDTO {
    constructor(user) {
        this.id = user.id;
        this.username = user.username;
        this.is_admin = user.is_admin;
    }
}

export const userFieldValidations = [
    { field: 'username', required: true, type: 'string' },
    { field: 'password', required: true, type: 'string' },
    { field: 'is_admin', required: false, type: 'boolean' }
];