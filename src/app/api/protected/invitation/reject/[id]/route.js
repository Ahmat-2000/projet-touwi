// app/api/protected/invitation/reject/[id]/route.js
import { InvitationHandler } from '@/utils/api/InvitationHandler';

const invitationHandler = new InvitationHandler();

export async function POST(request, { params }) {
    return (await invitationHandler.accept(params)).generateNextResponse();
}