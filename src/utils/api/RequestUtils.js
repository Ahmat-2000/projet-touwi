

export async function handleRequest(request) {
    const clonedRequest = await request.clone();
    const body = await clonedRequest.json();
    return body;
}