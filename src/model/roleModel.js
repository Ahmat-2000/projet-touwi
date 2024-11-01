
// Purpose: DTO for user model.
// We use DTOs to hide some fields from the client in the response.
export class RoleDTO {
    constructor(role) {
        this.id = role.id;
        this.name = role.name;
        this.description = role.description;
        this.can_read = role.can_read;
        this.can_write = role.can_write;
        this.can_manage_invitations = role.can_manage_invitations;
        this.can_manage_workspace = role.can_manage_workspace;
        this.can_manage_users = role.can_manage_users;
    }
}

export const roleFieldValidations = [
    { field: 'name', required: true, type: 'string', applyTo: ['POST', 'PUT'] },
    { field: 'description', required: false, type: 'string', applyTo: ['POST', 'PUT'] },
    { field: 'can_read', required: false, type: 'boolean', applyTo: ['POST', 'PUT'] },
    { field: 'can_write', required: false, type: 'boolean', applyTo: ['POST', 'PUT'] },
    { field: 'can_manage_invitations', required: false, type: 'boolean', applyTo: ['POST', 'PUT'] },
    { field: 'can_manage_workspace', required: false, type: 'boolean', applyTo: ['POST', 'PUT'] },
    { field: 'can_manage_users', required: false, type: 'boolean', applyTo: ['POST', 'PUT'] }
];