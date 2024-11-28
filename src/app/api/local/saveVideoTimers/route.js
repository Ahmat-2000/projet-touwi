import fs from 'fs';
import path from 'path';

export async function POST(request) {
    try {
        const data = await request.json();

        if (!data) {
            return new Response(JSON.stringify({ error: "Aucune donnée trouvée" }), {
                status: 400,
            });
        }

        const filePath = path.join(process.cwd(), "public", "uploads");
        const fullPath = path.join(filePath, "videoTimers.json");

        // Create uploads directory if it doesn't exist
        try {
            await fs.promises.access(filePath);
        } catch (error) {
            await fs.promises.mkdir(filePath, { recursive: true });
        }

        // Try to read existing file
        let existingData = {};
        try {
            const fileContent = await fs.promises.readFile(fullPath, 'utf8');
            existingData = JSON.parse(fileContent);
        } catch (error) {
            console.log('No existing file found or invalid JSON, creating new file');
        }

        // Merge new data with existing data
        const mergedData = { ...existingData, ...data };
        const jsonContent = JSON.stringify(mergedData, null, 2);

        await fs.promises.writeFile(fullPath, jsonContent);

        return new Response(
            JSON.stringify({ message: "Données sauvegardées avec succès" }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in videoTimers:', error);
        return new Response(
            JSON.stringify({ error: "Erreur lors de la sauvegarde du fichier" }),
            { status: 500 }
        );
    }
}
