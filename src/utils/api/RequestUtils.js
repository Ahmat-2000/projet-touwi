
export async function handleRequest(request) {
    const clonedRequest = request.clone();

    if (!clonedRequest.body) return null;
    try {
        const body = await clonedRequest.json();
        return body;
    } catch (error) {
        return null; 
    }
}
