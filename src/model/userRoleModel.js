
// Purpose: DTO for user model.
// We use DTOs to hide some fields from the client in the response.
export class UserRoleDTO {
    constructor(userRole) {
        this.id = userRole.id;
        this.user_id = userRole.user_id;
        this.role_id = userRole.role_id;
        this.workspace_id = userRole.workspace_id
    }
}

export const userRoleFieldValidations = [
    { field: 'user_id', required: true, type: 'string' },
    { field: 'role_id', required: true, type: 'string' },
    { field: 'workspace_id', required: true, type: 'string' }
];