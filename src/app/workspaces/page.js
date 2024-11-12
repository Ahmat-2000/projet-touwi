"use client";
import React, { useState, useEffect } from 'react';
import { apiService, apiRoutes } from '@/services/apiService';

const WorkspaceList = () => {
    const [workspaces, setWorkspaces] = useState([]);
    const [invitations, setInvitations] = useState({});
    const [userRoles, setUserRoles] = useState({});
    const [showInvitations, setShowInvitations] = useState({});
    const [showUserRoles, setShowUserRoles] = useState({});

    useEffect(() => {
        apiService.get(apiRoutes.workspaces())
            .then(({response, body}) => setWorkspaces(body.data))
            .catch(error => console.error(error));
    }, []);

    const fetchInvitations = (workspaceId) => {
        if (!invitations[workspaceId]) {
            apiService.get(apiRoutes.invitations())
                .then(({response, body}) => setInvitations(prev => ({ ...prev, [workspaceId]: body.data })))
                .catch(error => console.error(error));
        }
    };

    const fetchUserRoles = (workspaceId) => {
        if (!userRoles[workspaceId]) {
            apiService.get(apiRoutes.userRoles())
                .then(({response, body}) => setUserRoles(prev => ({ ...prev, [workspaceId]: body.data })))
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

    const handleShowInvitations = (workspaceId) => {
        setShowInvitations(prev => ({ ...prev, [workspaceId]: !prev[workspaceId] }));
        if (!invitations[workspaceId]) fetchInvitations(workspaceId);
    };

    const handleShowUserRoles = (workspaceId) => {
        setShowUserRoles(prev => ({ ...prev, [workspaceId]: !prev[workspaceId] }));
        if (!userRoles[workspaceId]) fetchUserRoles(workspaceId);
    };

    if (workspaces.length === 0) return <div>No workspaces</div>;

    return (
        <div>
            <h1>Workspaces</h1>
            <ul>
                {workspaces.map(workspace => (
                    <li key={workspace.id}>
                        {workspace.name}
                        <button onClick={() => handleShowInvitations(workspace.id)}>
                            Invitations
                        </button>
                        {showInvitations[workspace.id] && (
                            <ul>
                                {invitations[workspace.id]?.map(invitation => (
                                    <li key={invitation.id}>{invitation.email}</li>
                                ))}
                            </ul>
                        )}
                        <button onClick={() => handleShowUserRoles(workspace.id)}>
                            Users
                        </button>
                        {showUserRoles[workspace.id] && (
                            <ul>
                                {userRoles[workspace.id]?.map(userRole => (
                                    <li key={userRole.id}>{userRole.role}</li>
                                ))}
                            </ul>
                        )}
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