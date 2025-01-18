import fs from 'fs';
import path from 'path';
 

export async function POST(request) {
    try {
        const data = await request.json() ;

        if (!data) {
          return new Response(JSON.stringify({ error: "Aucune donnée trouvée" }), {
            status: 400,
          });
        }
        
        const name = data.name.split('.')[0];
    
    
        // Define the file path
        const filePath = path.join(process.cwd(), "public", "uploads");

        try {
            await fs.promises.access(filePath); 
        } catch (error) {
          return new Response(
            JSON.stringify({ error: "Projet non trouvé" }),
            { status: 400 }
          );
        }

        const jsonContent = JSON.stringify(data, null)

        await fs.promises.writeFile(path.join(filePath, "videoSynchronisation.json"), jsonContent);
        return new Response(
          JSON.stringify({ message: "Données sauvegardées avec succès" }),
          { status: 200 }
        );
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