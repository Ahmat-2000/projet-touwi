import { NextResponse } from 'next/server';


/**
 * This function responds to GET type requests made to the api
 * localhost:3000/api/example/route.js 
 */
export async function GET(request) {
  //Todo
  return NextResponse.json({message: "Cette objet sera envoyé dans la reponse"},{status: 200});
}
 
/**
 * This function responds to GET type requests made to the api
 * localhost:3000/api/example/route.js 
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