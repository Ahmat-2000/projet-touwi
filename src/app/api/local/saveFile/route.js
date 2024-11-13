import fs from 'fs';
import path from 'path';

export const config = {
    api: {
        bodyParser: false,
    },
};
 

export async function POST(request) {
    try {
        const formData = await request.formData();

        const file = formData.get("file");

        if (!file) {
          return new Response(JSON.stringify({ error: "Aucun fichier trouvé" }), {
            status: 400,
          });
        }

        const name = file.name.split('.')[0];
    
        const buffer = Buffer.from(await file.arrayBuffer()); 
    
        // Définir le chemin du fichier
        const savePath = path.join(process.cwd(), "public", "uploads", name)
        const filePath = path.join(savePath, file.name);

        try {
          await fs.promises.access(savePath); 
        } catch (error) {
          await fs.promises.mkdir(savePath, { recursive: true });
        }
    
        await fs.promises.writeFile(filePath, buffer);
    
        return new Response(
          JSON.stringify({ message: "Fichier téléchargé avec succès" }),
          { status: 200 }
        );
      } catch (error) {
        console.error(error);
        return new Response(
          JSON.stringify({ error: "Erreur lors du téléchargement du fichier" }),
          { status: 500 }
        );
      }
}

export async function HEAD(request) {
  //Todo
}
export async function PUT(request) {
  // Todo
}
 
export async function DELETE(request) {
  // Todo
}
 
export async function PATCH(request) {
  // Todo
}