
// Purpose: DTO for user model.
// We use DTOs to hide some fields from the client in the response.
export class RoleDTO {
    constructor(role) {
        this.id = role.id;
    }
}

export const roleFieldValidations = [
    { field: 'name', required: true, type: 'string' },
    { field: 'description', required: false, type: 'string' },
    { field: 'can_read', required: false, type: 'boolean' },
    { field: 'can_write', required: false, type: 'boolean' },
    { field: 'can_manage_invitations', required: false, type: 'boolean' },
    { field: 'can_manage_workspace', required: false, type: 'boolean' },
    { field: 'can_manage_users', required: false, type: 'boolean' }
];