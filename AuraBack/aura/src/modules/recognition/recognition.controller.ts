import { Body, Controller, Post, HttpException, HttpStatus } from '@nestjs/common';
import { RecognitionService } from './recognition.service';

@Controller('recognition')
export class RecognitionController {
    constructor(private readonly recognitionService: RecognitionService) {}

    @Post('recognize_faces')
    async recognizeFaces(
        @Body('aula') aulaCode: string,
        @Body('tiempo') time: number
    ): Promise<any> {
        if (!aulaCode) {
            throw new HttpException('El código del aula es obligatorio.', HttpStatus.BAD_REQUEST);
        }

        try {
            const detectedFaces = await this.recognitionService.recognizeFaces(aulaCode, time);
            return {
                detected_faces: detectedFaces,
                message: 'ok',
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException(
                'notok',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('stop')
  async stopRecognition(): Promise<any> {
    try {
      return await this.recognitionService.stopRecognition();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;  
      }
      throw new HttpException(
        'Error al detener el reconocimiento facial.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
