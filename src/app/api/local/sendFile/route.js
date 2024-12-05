import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
    try {
        const formData = await request.json();
        const name = formData.filename;

  
        const savePath = path.join(process.cwd(), "public", "uploads")
        const filePath = path.join(savePath, name);

        try {
          await fs.promises.access(filePath); 
        } catch (error) {
          return new Response(
            JSON.stringify({ error: "Fichier non trouvé" }),
            { status: 400 }
          );
        }
        
        const fileBuffer = await fs.promises.readFile(filePath);

        return new Response(fileBuffer, {
          status: 200,
          headers: {
              "Content-Type": "application/octet-stream", 
          }
      });
    
        
      } catch (error) {
        console.log(error)
        return new Response(
          JSON.stringify({ error: "Erreur lors de l'envoie du fichier" }),
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