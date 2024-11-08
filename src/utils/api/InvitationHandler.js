// services/api/InvitationHandler.js
import { ChronosResponse } from '@/utils/api/ChronosResponse';
import prisma from '@/lib/prisma';

export class InvitationHandler {
    async accept(params) {
        return this.handleInvitationAction(params, 'accept');
    }

    async reject(params) {
        return this.handleInvitationAction(params, 'reject');
    }
    
    async handleInvitationAction(params, actionType) {
        const user = { id: 2 }; // TODO : To replace with the actual user

        const { id } = params;

        // Retrive the invitation and check if it exists
        const invitation = await prisma.invitation.findUnique({ where: { id: parseInt(id) } });
        if (!invitation) { 
            return new ChronosResponse(404, 'Invitation not found.');
        }

        // Verify that the invitation is for the user
        if (invitation.shared_with_id !== user.id) {
            return new ChronosResponse(403, 'You are not authorized to perform this action.');
        }

        // Accept the invitation if the action is 'accept'
        if (actionType === 'accept') {
            await prisma.userRole.create({
                data: {
                    user_id: invitation.shared_with_id,
                    workspace_id: invitation.workspace_id,
                    role_id: invitation.role_id
                }
            });
        }

        // Delete the invitation in both cases
        await prisma.invitation.delete({
            where: { id: parseInt(id) }
        });

        // Return the appropriate message
        const message = actionType === 'accept' ? 'Invitation accepted' : 'Invitation rejected';
        return new ChronosResponse(200, message);
    }
}
