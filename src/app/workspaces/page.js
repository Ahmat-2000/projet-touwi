"use client";
import React, { useState, useEffect } from 'react';
import { apiService, apiRoutes } from '@/services/apiService';

const WorkspaceList = () => {
    const [workspaces, setWorkspaces] = useState([]);
    const [invitations, setInvitations] = useState({});
    const [userRoles, setUserRoles] = useState({});

    useEffect(() => {
        apiService.get(apiRoutes.workspaces())
            .then(({ response, body }) => setWorkspaces(body.data))
            .catch(error => console.error(error));
    }, []);

    const fetchInvitations = (workspaceId) => {
        if (!invitations[workspaceId]) {
            apiService.get(apiRoutes.invitations())
                .then(({ response, body }) => {
                    const invitationsByWorkspace = {};
        
                    for (const invitation of body.data) {
                        const { workspace_id } = invitation;
        
                        if (!invitationsByWorkspace[workspace_id]) {
                            invitationsByWorkspace[workspace_id] = [];
                        }
                        invitationsByWorkspace[workspace_id].push(invitation);
                    }
        
                    setInvitations(prev => ({ ...prev, ...invitationsByWorkspace }));
                })
                .catch(error => console.error(error));
        }
    };

    const fetchUserRoles = (workspaceId) => {
        if (!userRoles[workspaceId]) {
            apiService.get(apiRoutes.userRoles())
                .then(({ response, body }) => {
                    const userRolesByWorkspace = {};
        
                    for (const userRole of body.data) {
                        const { workspace_id } = userRole;
        
                        if (!userRolesByWorkspace[workspace_id]) {
                            userRolesByWorkspace[workspace_id] = [];
                        }
                        userRolesByWorkspace[workspace_id].push(userRole);
                    }
        
                    setUserRoles(prev => ({ ...prev, ...userRolesByWorkspace }));
                })
                .catch(error => console.error(error));
        }
    };

    const deleteWorkspace = (workspaceId, workspaceName) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le workspace ${workspaceName} ?`)) {
            apiService.delete(apiRoutes.workspace(workspaceId))
                .then(() => setWorkspaces(prev => prev.filter(ws => ws.id !== workspaceId)))
                .catch(error => console.error(error));
        }
    };

    if (!workspaces || workspaces.length === 0) return <div>No workspaces</div>;

    return (
        <div>
            <h1>Workspaces</h1>
            <ul>
                {workspaces.map(workspace => (
                    <li key={workspace.id}>
                        <strong>{workspace.name}</strong>
                        
                        {/* Afficher les invitations, chargées si nécessaire */}
                        <button onClick={() => fetchInvitations(workspace.id)}>
                            Voir Invitations
                        </button>
                        <ul>
                            {invitations[workspace.id]?.length > 0 ? (
                                invitations[workspace.id].map(invitation => (
                                    <li key={invitation.id}>{invitation.email}</li>
                                ))
                            ) : (
                                <li>Aucune invitation</li>
                            )}
                        </ul>
                        
                        {/* Afficher les utilisateurs, chargés si nécessaire */}
                        <button onClick={() => fetchUserRoles(workspace.id)}>
                            Voir Utilisateurs
                        </button>
                        <ul>
                            {userRoles[workspace.id]?.length > 0 ? (
                                userRoles[workspace.id].map(userRole => (
                                    <li key={userRole.id}>{userRole.role}</li>
                                ))
                            ) : (
                                <li>Aucun utilisateur</li>
                            )}
                        </ul>
                        
                        {/* Bouton pour supprimer le workspace */}
                        <button onClick={() => deleteWorkspace(workspace.id, workspace.name)}>
                            Supprimer
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default WorkspaceList;
