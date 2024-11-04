import { prisma } from '@prisma/client';

/**
 * Génére une liste des permissions pour un utilisateur donné dans un workspace spécifique.
 * @param {Object} user - L'utilisateur dont les permissions sont récupérées.
 * @param {Object} workspace - Le workspace associé.
 * @returns {Promise<string[]>} - Liste des permissions que l'utilisateur possède.
 */
export async function getPermissions(user, workspace) {
    const permissions = [];

    // Vérifier si l'utilisateur est admin global
    user.is_admin ? permissions.push('admin') : permissions.push('user');

    if (!workspace) return permissions; // Retourne les permissions par défaut si le workspace n'est pas spécifié

    // Récupérer le rôle de l'utilisateur dans le workspace spécifié
    const userRole = await prisma.userRole.findFirst({
        where: {
            user_id: user.id,
            workspace_id: workspace.id,
        },
        include: {
            Role: true, // Inclure les détails du rôle pour accéder aux permissions
        },
    });

    // Vérifier les permissions dans le rôle de l'utilisateur
    if (!userRole || !userRole.Role) return permissions; // Retourne les permissions par défaut
    const role = userRole.Role;

    if (role.can_read) permissions.push('can_read');
    if (role.can_write) permissions.push('can_write');
    if (role.can_manage_invitations) permissions.push('can_manage_invitations');
    if (role.can_manage_workspace) permissions.push('can_manage_workspace');
    if (role.can_manage_users) permissions.push('can_manage_users');

    return permissions; // Retourne uniquement les permissions accordées
}
