import { manipulateAsync } from "expo-image-manipulator"

export let imageCropper = async ({
    uri,
    height,
    width
  }) => {
    return await manipulateAsync(uri,
      [
        {
          crop: {
            height: height * 0.5,
            width: width * 0.5,
            originX: 0,
            originY: 0
          }
        }
      ],
      {
        base64: true,
        compress: 1
      },
    )
  }