import { NextResponse } from 'next/server';

/**
 * Cette fonction répond aux requêtes de type GET faites à l'api
 * localhost:3000/api/team-fileSystem/route.js 
 */
export async function GET(request) {
  //Todo
  return NextResponse.json({message: "Cette objet sera envoyé dans la reponse"},{status: 200});
}
 
/**
 * Cette fonction répond aux requêtes de type POST faites à l'api
 * localhost:3000/api/team-fileSystem/route.js 
 */
export async function POST(request) {
  // Todo
  return NextResponse.json({message: "Cette objet sera envoyé dans la reponse"},{status: 200});
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
 