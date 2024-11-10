
// Purpose: DTO for user model. 
// We use DTOs to hide some fields from the client in the response.
export class InvitationDTO {
    constructor(invitation) {
        this.id = invitation.id;
        this.workspace_id = invitation.workspace_id;
        this.owner_id = invitation.owner_id;
        this.role_id = invitation.role_id;
        this.shared_with_id = invitation.shared_with_id;
    }
}

export const invitationFieldValidations = [
    { field: 'workspace_id', required: true, type: 'number', applyTo: ['POST'], prismaConnect: "Workspace" },
    { field: 'owner_id', required: true, type: 'number', applyTo: [ ], prismaConnect: "User_Invitation_owner_idToUser"},
    { field: 'role_id', required: true, type: 'number', applyTo: ['POST'], prismaConnect: "Role" },
    { field: 'shared_with_id', required: true, type: 'number', applyTo: ['POST'], prismaConnect: "User_Invitation_shared_with_idToUser" }
];