import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: '',
    dangerouslyAllowBrowser: true
});

export const getBarcode = async (url: string) => {
    const response: any = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: "Retrieve the scanned barcode number from this image and return it as a string. Sample response looks like =  '193857929'. If you do not know the barcode number, return an empty string " },
                    {
                        type: "image_url",
                        image_url: {
                            "url": url,
                        },
                    },
                ],
            },
        ],
    });
    if (response.choices && response!.choices![0].message!.content[0].content[0].text) {
        return response.choices[0].message.content[0].content[0].text;
    } else {
        return "";
    }
}
