import { GDrive } from "@robinbobin/react-native-google-drive-api-wrapper";

type props = {
    drive: GDrive;
    base64: string;
    extension: string;
    filename: string;
    folderId?: string;
}


export let driveImageUploader = async ({
    drive,
    base64,
    extension,
    filename,
    folderId = 'root'
}: props) => {

    return await drive
        .files
        .newMultipartUploader()
        .setData(base64, `image/${extension}`)
        .setIsBase64(true)
        .setRequestBody({
            name: filename,
            parents: [folderId]
        })
        .execute();
}