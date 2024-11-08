import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const workspacesPath = path.join(process.cwd(), 'workspaces');

if(!fs.existsSync(workspacesPath)) fs.mkdirSync(workspacesPath, { recursive: true });

/**
 * Get a workspace
 * @param {string} path The path of the workspace
 * @returns {string} The files in the workspace
 */
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

/**
 * Create a workspace
 * @returns {string} The path of the created workspace
 */
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

/**
 * Delete a workspace
 * @param {string} path The path of the workspace
 * @returns {string} The result of the operation
 */
export async function deleteWorkspace(path) {
    try {
        if (!fs.existsSync(path)) {
            return { message: 'Workspace not found.' };
        }
        fs.rmdirSync(path, { recursive: true, force: true });
        return { message: `Workspace deleted successfully.` };

    } catch (error) {
        console.error(error);
        return { message: 'Error deleting workspace.' };
    }
}

/**
 * Add a video to a workspace
 * @param {string} path The path of the workspace
 * @param {File} video The video to add
 * @returns {string} The result of the operation
 */
export async function addVideoToWorkspace(path, video) {
    try {
        if (!fs.existsSync(path)) {
            return { message: 'Workspace not found.' };
        }
        fs.writeFileSync(`${path}/${video.name}`, video.data);
        return { message: `Video added successfully.` };
    } catch (error) {
        console.error(error);
        return { message: 'Error adding video.' };
    }
}

/**
 * Add a CSV file to a workspace
 * @param {string} path The path of the workspace
 * @param {File} file The file to add
 * @returns {string} The result of the operation
 */
export async function addTouwiFileToWorkspace(path, file) {
    try {
        if (!fs.existsSync(path)) {
            return { message: 'Workspace not found.' };
        }
        fs.writeFileSync(`${path}/data.csv`, file.data);
        return { message: `Data added successfully.` };
    } catch (error) {
        console.error(error);
        return { message: 'Error adding data.' };
    }
}