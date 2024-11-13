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
        const filePath = path.join(process.cwd(), "public", "uploads", name, file.name);

        try {
            await fs.promises.access(filePath); 
            await fs.promises.writeFile(filePath, buffer);

            return new Response(
              JSON.stringify({ message: "Fichier sauvegardé avec succès" }),
              { status: 200 }
            );
        } catch (error) {
          return new Response(
            JSON.stringify({ error: "Fichier de sauvegarde non trouvé" }),
            { status: 400 }
          );
        }
      } catch (error) {
        return new Response(
          JSON.stringify({ error: "Erreur lors de la sauvegarde du fichier" }),
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