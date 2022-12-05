import { VFile } from "vfile"
import { VFileMessage } from "vfile-reporter/lib";


export const VimReporter = (inputs: VFile|VFile[]): string => {
    const sources = Array.isArray(inputs) ? inputs : [inputs];
    const result: string[] = [];

    sources.forEach((file: VFile) => {
        file.messages.forEach((item: VFileMessage) => {
            result.push(`${file.history[0]}:${item.line}:${item.column}:${item.message}`);
        });
    });
    return result.join('\n');
}