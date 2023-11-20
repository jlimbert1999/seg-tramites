// export const getBase64ImageFromUrl = async (imageUrl: string): Promise<string> => {
//     var res = await fetch(imageUrl);
//     var blob = await res.blob();
//     return new Promise((resolve, reject) => {
//         var reader = new FileReader();
//         reader.addEventListener("load", function () {
//             if (reader.result) {
//                 resolve(reader.result.toString())
//             }
//         }, false);
//         reader.readAsDataURL(blob);
//     })
// }
