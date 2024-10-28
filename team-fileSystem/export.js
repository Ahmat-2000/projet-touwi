//file is a File object (works with a Blob but the name will be 'undefined.csv')
//exports the file and saves it locally on the user's computer
//is not yet linked to a button in the UI
export default function exportFile(file){

    if (!(file instanceof File) && !(file instanceof Blob)) {
        console.error("Alerte");
        return;
    }
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(link.href);
}