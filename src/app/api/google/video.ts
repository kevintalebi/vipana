// To run this code you need to install the following dependencies:
// npm install @google/genai
// npm install -D @types/node

import {
    GoogleGenAI,
  } from '@google/genai';
  
  import {writeFile} from 'fs/promises';
  
  async function main() {
    const ai = new GoogleGenAI({
      apiKey: process.env['GEMINI_API_KEY'],
    });
  
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      source: {
        prompt: `INSERT_INPUT_HERE`,
      },
      config: {
          numberOfVideos: 1,
          aspectRatio: '16:9',
          resolution: '720p',
          personGeneration: 'dont_allow',
          durationSeconds: 8,
      },
    });
  
    while (!operation.done) {
      console.log(`Video ${operation.name} has not been generated yet. Check again in 10 seconds...`);
      await new Promise((resolve) => { setTimeout(resolve, 10000); });
      operation = await ai.operations.getVideosOperation({
        operation: operation,
      });
    }
  
    console.log(`Generated ${operation.response?.generatedVideos?.length ?? 0} video(s).`);
  
    operation.response?.generatedVideos?.forEach(async (generatedVideo, i) => {
      console.log(`Video has been generated: ${generatedVideo?.video?.uri}`);
      const response = await fetch(`${generatedVideo?.video?.uri}&key=${process.env['GEMINI_API_KEY']}`);
      const buffer = await response.arrayBuffer();
      // TODO: go/ts59upgrade - Remove this suppression after TS 5.9.2 upgrade
      //  error TS2345: Argument of type 'Buffer' is not assignable to parameter of type 'string | ArrayBufferView | Iterable<string | ArrayBufferView> | AsyncIterable<string | ArrayBufferView> | Stream'.
      // @ts-ignore
      await writeFile(`video_${i}.mp4`, Buffer.from(buffer));
      console.log(`Video ${generatedVideo?.video?.uri} has been downloaded to video_${i}.mp4.`);
    });
  }
  
  main();
  
  
  