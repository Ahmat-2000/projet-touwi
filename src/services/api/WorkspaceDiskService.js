import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
const workspacesPath = path.join(process.cwd(), 'workspaces');

export async function getWorkspace(path) {
    try {
        if (!fs.existsSync(path)) {
            return { message: 'Workspace not found.' };
        }

        const files = fs.readdirSync(path);
        return files;

    } catch (error) {
        console.error(error);
        return { message: 'Error retrieving workspace.' };
    }
}

export async function createWorkspace() {
    
    try {
        const workspacePath = path.join(workspacesPath, `workspace_${uuidv4()}`);

        if (fs.existsSync(workspacePath)) {
            return { message: 'Workspace already exists.' };
        } else {
            fs.mkdirSync(workspacePath);
        }
        return workspacePath;

    } catch (error) {
        console.error(error);
        return { message: 'Error creating workspace.' };
    }
}

export async function deleteWorkspace(path) {
    try {
        if (!fs.existsSync(path)) {
            return { message: 'Workspace not found.' };
        }
        fs.rmdirSync(path, { recursive: true });
        return { message: `Workspace deleted successfully.` };

    } catch (error) {
        console.error(error);
        return { message: 'Error deleting workspace.' };
    }
}