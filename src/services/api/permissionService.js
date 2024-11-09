import prisma from "@/lib/prisma";

/**
 * Retrieve the permissions for all request in the api routes based on the user and workspace if it exists.
 * If the workspace is not specified, the default permissions are returned (user or admin).
 * @param {Object} user - The user object.
 * @param {Object} workspace - The workspace object.
 * @returns {Array} - Array of permissions.
 */
export async function getPermissions(user, workspace) {
    const permissions = [];

    // Check if the user is a global admin; assign 'admin' or 'user' based on this status
    user.is_admin ? permissions.push('admin') : permissions.push('user');

    if (!workspace) return permissions; // Return default permissions if no workspace is specified

    // Retrieve the user's role within the specified workspace
    const userRole = await prisma.userRole.findFirst({
        where: {
            user_id: user.id,
            workspace_id: workspace.id,
        },
        include: { Role: true, },
    });

    // If no role is found, return default permissions; otherwise, add 'related_user' permission
    if (!userRole || !userRole.Role) return permissions; 
    else permissions.push('related_user'); 

    const role = userRole.Role;

    // Add permissions based on the user's role capabilities within the workspace
    if (role.can_read) permissions.push('can_read');
    if (role.can_write) permissions.push('can_write');
    if (role.can_manage_invitations) permissions.push('can_manage_invitations');
    if (role.can_manage_workspace) permissions.push('can_manage_workspace');
    if (role.can_manage_users) permissions.push('can_manage_users');

    return permissions; // Return only the permissions that the user has been granted
}
