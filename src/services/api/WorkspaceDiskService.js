import fs from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const workspacesPath = join(process.cwd(), 'workspaces');

if(!fs.existsSync(workspacesPath)) fs.mkdirSync(workspacesPath, { recursive: true });

/**
 * Get a workspace
 * @param {string} path The path of the workspace
 * @returns {string} The files in the workspace
 */
export async function getWorkspace(path) {
    try {
        if (!fs.existsSync(join(workspacesPath, path))) {
            return { message: 'Workspace not found.' };
        }

        const files = fs.readdirSync(join(workspacesPath, path));
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
        const workspacePath = `workspace_${uuidv4()}`;

        if (fs.existsSync(join(workspacesPath, workspacePath))) {
            return { message: 'Workspace already exists.' };
        } else {
            fs.mkdirSync(join(workspacesPath, workspacePath));
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
        if (!fs.existsSync(join(workspacesPath, path))) {
            return { message: 'Workspace not found.' };
        }
        fs.rmSync(join(workspacesPath, path), { recursive: true, force: true });
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
        if (!fs.existsSync(join(workspacesPath, path))) {
            return { message: 'Workspace not found.' };
        }
        fs.writeFileSync(join(workspacesPath, workspacePath, video.name), video.data);
        return { message: `Video added successfully.` };
    } catch (error) {
        console.error(error);
        return { message: 'Error adding video.' };
    }
}

/**
 * Get a video from a workspace
 * @param {string} path The path of the workspace
 * @param {string} videoName The name of the video
 * @returns {string} The video data
 */
export async function getVideoFromWorkspace(path, videoName) {
    try {
        if (!fs.existsSync(join(workspacesPath, path))) {
            return { message: 'Workspace not found.' };
        }
        const video = fs.readFileSync(join(workspacesPath, path, videoName));
        return video;
    } catch (error) {
        console.error(error);
        return { message: 'Error retrieving video.' };
    }
}

/**
 * Add a CSV file to a workspace
 * @param {string} path The path of the workspace
 * @param {File} file The file to add
 * @returns {string} The result of the operation
 */
export async function addTouwiFileToWorkspace(path, data) {
    try {
        if (!fs.existsSync(join(workspacesPath, path))) {
            return { message: 'Workspace not found.' };
        }
        fs.writeFileSync(join(workspacesPath, workspacePath, 'data.touwi'), data);
        return { message: `Data added successfully.` };
    } catch (error) {
        console.error(error);
        return { message: 'Error adding data.' };
    }
}

/**
 * Get a CSV file from a workspace
 * @param {string} path The path of the workspace
 * @returns {string} The CSV data
 */
export async function getTouwiFileFromWorkspace(path) {
    try {
        if (!fs.existsSync(join(workspacesPath, path))) {
            return { message: 'Workspace not found.' };
        }
        const data = fs.readFileSync(join(workspacesPath, path, 'data.touwi'));
        return data;
    } catch (error) {
        console.error(error);
        return { message: 'Error retrieving data.' };
    }
}