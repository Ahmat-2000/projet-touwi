
// Purpose: DTO for user model.
// We use DTOs to hide some fields from the client in the response.
export class WorkspaceDTO {
    constructor(workspace) {
        this.id = workspace.id;
        this.name = workspace.name;
        this.path = workspace.path;
    }
}

export const workspaceFieldValidations = [
    { field: 'name', required: true, type: 'string', applyTo: ['POST', 'PUT'] },
    { field: 'path', required: false, type: 'string', applyTo: [] }
];